use ai_tools_common::*;

const GENERAL_MANUAL: &str = "GENERAL_MANUAL";

#[tauri::command]
pub fn ask_get_implementations(action: String) -> Result<Vec<Implementation>, ()> {
    match action.as_str() {
        "rewrite" => Ok(vec![Implementation {
            ident: GENERAL_MANUAL.into(),
            available: Some(true),
        }]),
        "genSearch" => Ok(vec![Implementation {
            ident: GENERAL_MANUAL.into(),
            available: Some(true),
        }]),
        "ask" => Ok(vec![Implementation {
            ident: GENERAL_MANUAL.into(),
            available: Some(true),
        }]),
        _ => {
            tracing::error!("unknown action: {}", action);
            Err(())
        }
    }
}

const REWRITE_PROMPT_DEFAULT: &str = r#"As a writing assistant, please refine the text provided by the user into English, regardless of the original language it is in. You may alter word choices and rephrase sentences to enhance clarity and coherence. Ensure that your response is in English and that the original meaning of the user's text is preserved.

USER'S TEXT: "#;

const GEN_SEARCH_PROMPT_DEFAULT: &str = r#"**Task Description**:

As a language model assistant, your goal is to help users find information by generating effective search queries based on their questions. When provided with a user's question, follow these steps to produce a list of relevant search terms suitable for use in search engines like Google.

**Instructions**:

1. **Comprehend the Question**:
   - Read the user's question carefully to fully understand the intent and key information being requested.
   - Identify the main topic and any specific details or parameters within the question.

2. **Extract Key Components**:
   - Highlight the essential keywords, phrases, and concepts that are crucial to finding accurate information.
   - Consider any specifics such as time frames, locations, quantities, or categories mentioned.

3. **Generate Search Queries**:
   - Create a list of search queries using the extracted key components.
   - Phrase the queries as users would typically enter them into a search engine.
   - Ensure the queries are clear, concise, and free of unnecessary words.

4. **Include Synonyms and Related Terms** (if applicable):
   - Incorporate synonyms or alternative phrases to cover variations in terminology.
   - Suggest related topics that may broaden the search and provide additional relevant information.

5. **Maintain Relevance and Specificity**:
   - Keep the search queries focused on the user's original question.
   - Avoid introducing unrelated topics or overly broad terms that might dilute the search results.

6. **Format the Response**:
   - Present the search queries in a numbered or bulleted list for easy readability.
   - Ensure proper spelling and grammar to enhance effectiveness.

**Example**:

*User's Question*:
"How can I improve my home's energy efficiency during winter months?"

*Generated Search Queries*:

- Ways to improve home energy efficiency in winter
- Tips for making house energy-efficient during cold weather
- Winter energy-saving methods for homes
- How to reduce heating costs in winter
- Energy-efficient home improvements for winter

---

**Output**:

When given a user's question, provide the generated list of search queries following the guidelines above. Your response should assist the user in finding the information they need quickly and efficiently through search engines.

USER'S QUESTION: "#;

// Answer prompt for OpenAI
// You are ChatGPT, a large language model trained by OpenAI.
// Knowledge cutoff: 2021-09
// Current date: [current date]

// For manual, just feed the question itself.
const MATERIAL_BASED_PROMPT_HEADER: &str = "Please read the following material carefully:";
const MATERIAL_BASED_PROMPT_SEP: &str =
    "Based solely on the information provided in this material, answer the following question:";
const MATERIAL_BASED_PROMPT_END: &str = "Your answer should be thorough and reference specific details from the material without adding any external information.";

#[derive(Debug, serde::Deserialize)]
#[serde(tag = "name", rename_all = "camelCase")]
pub enum RunAction {
    Rewrite {
        question: String,
    },
    GenSearch {
        question: String,
    },
    Ask {
        question: String,
        material: Option<String>,
    },
}

#[tauri::command]
pub fn ask_run_action(
    action: RunAction,
    ident: String,
    response: tauri::ipc::Channel<String>,
) -> Result<(), ()> {
    let span = tracing::info_span!("ask_run_action");
    let _enter = span.enter();
    match action {
        RunAction::Rewrite { question } => match ident.as_str() {
            GENERAL_MANUAL => response
                .send(format!("manual:{REWRITE_PROMPT_DEFAULT}{question}"))
                .map_err(|err| {
                    tracing::error!("error sending response: {err}");
                }),
            unknown => {
                tracing::error!("unknown rewrite implementation ident: {unknown}");
                Err(())
            }
        },
        RunAction::GenSearch { question } => match ident.as_str() {
            GENERAL_MANUAL => response
                .send(format!("manual:{GEN_SEARCH_PROMPT_DEFAULT}{question}"))
                .map_err(|err| {
                    tracing::error!("error sending response: {err}");
                }),
            unknown => {
                tracing::error!("unknown genSearch implementation ident: {unknown}");
                Err(())
            }
        },
        RunAction::Ask { question, material } => match ident.as_str() {
            GENERAL_MANUAL => response
                .send(match material {
                    Some(material) =>
                        format!("manual:{MATERIAL_BASED_PROMPT_HEADER}\n\n{material}\n\n{MATERIAL_BASED_PROMPT_SEP}\n\n{question}\n\n{MATERIAL_BASED_PROMPT_END}"),
                    None => format!("manual:{question}"),
                })
                .map_err(|err| {
                    tracing::error!("error sending response: {err}");
                }),
            unknown => {
                tracing::error!("unknown ask implementation ident: {unknown}");
                Err(())
            }
        }
    }
}
