use eventsource_stream::Eventsource;
use crate::{log_error, AppState, RunActionOutput, RunActionResult};
use futures_util::stream::StreamExt;
use tracing::{error, info, instrument};

#[derive(serde::Deserialize)]
struct ChatChunk {
    choices: Vec<ChatChoice>,
}

#[derive(serde::Deserialize)]
struct ChatChoice {
    delta: ChatDelta,
}

#[derive(serde::Deserialize)]
struct ChatDelta {
    content: Option<String>,
}

#[instrument(skip(state))]
pub async fn chat_completion(state: &AppState, payload: &serde_json::Value) -> RunActionResult {
    let api_url = "https://api.openai.com/v1/chat/completions";
    let client = state.http_client();
    let config = state.get_config();
    let api_key = config
        .openai_api_key
        .as_ref()
        .ok_or_else(|| log_error("API Key not configured"))?;
    let resp = client
        .post(api_url)
        .bearer_auth(api_key)
        .json(payload)
        .send()
        .await
        .map_err(log_error)?
        .error_for_status()
        .map_err(log_error)?
        .bytes_stream()
        .eventsource()
        .map(|event| {
            let event = event
                .map_err(|err| info!("Failed to read chat completion response: {err}"))?;
            if event.event != "message" || event.data == "[DONE]" {
                return Ok(String::new())
            }

            let chunk = serde_json::from_str::<ChatChunk>(&event.data)
                .map_err(|err| error!("Failed to deserialize OpenAI response from event: {err}"))?;
            Ok(chunk.choices.into_iter().next().and_then(|c| c.delta.content)
                .unwrap_or(String::new()))
        });

    Ok(RunActionOutput::Response(Box::pin(resp)))
}
