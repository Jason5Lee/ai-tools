use ai_tools_common::{tracing, Manual};
use ai_tools_common::tracing::instrument;
use ai_tools_common::{ask, AppState, Implementation};
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn ask_get_implementations(
    handle: AppHandle,
    action: String,
) -> Result<Vec<Implementation>, ()> {
    ask::get_implementations(&handle.state::<AppState>().get_config(), action)
}

#[tauri::command]
#[instrument(skip(handle, response))]
pub async fn ask_run_action(
    handle: AppHandle,
    action: ask::RunAction,
    ident: String,
    response: tauri::ipc::Channel<String>,
) -> Result<Option<Manual>, ()> {
    crate::translate_run_action_result(
        ask::run_action(&handle.state::<AppState>(), action, ident).await,
        response,
    )
    .await
}
