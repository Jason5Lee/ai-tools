pub mod ask;
pub mod config;
pub mod openai_api;

pub use futures_util;
pub use smol_str;
pub use tracing;

use crate::config::Config;
use futures_util::stream::BoxStream;
use std::fmt::Display;
use std::sync::{Arc, RwLock};

pub type Str = smol_str::SmolStr;

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Manual {
    prompt: String,
}

pub enum RunActionOutput {
    Response(BoxStream<'static, Result<String, ()>>),
    Manual(Manual)
}
pub type RunActionResult = Result<RunActionOutput, ()>;

pub struct AppState {
    config: RwLock<Arc<Config>>,
    http_client: reqwest::Client,
}

impl AppState {
    pub fn new(config: Config) -> Self {
        Self {
            config: RwLock::new(Arc::new(config)),
            http_client: reqwest::Client::new(),
        }
    }

    pub fn set_config(&self, config: Arc<Config>) {
        *self.config.write().unwrap() = config;
    }

    pub fn get_config(&self) -> Arc<Config> {
        self.config.read().unwrap().clone()
    }

    pub fn http_client(&self) -> &reqwest::Client {
        &self.http_client
    }
}

pub fn prompt_into_manual_result(prompt: String) -> RunActionResult {
    Ok(RunActionOutput::Manual(Manual { prompt }))
}

pub fn log_error<E: Display>(err: E) {
    println!("{err}");
    tracing::error!("{err}");
}

#[derive(serde::Serialize)]
pub struct Implementation {
    pub ident: Str,
    pub available: Option<bool>,
}

// pub fn unknown_method_error() -> serde_json::Value {
//     let mut map = serde_json::Map::new();
//     map.insert("ident".into(), "UNKNOWN_METHOD".into()).unwrap();
//     serde_json::Value::Object(map)
// }
//
// #[cfg(test)]
// mod tests {
//     use super::*;
//
//     #[test]
//     fn test_simple_context() {
//         let test_err = std::io::Error::new(
//             std::io::ErrorKind::NotFound,
//             "The system cannot find the file specified.");
//         let result = add_context_fn!("OPEN_CONFIG_FILE")(test_err);
//         assert_eq!(format!("{:?}", result),
//             r#"ContextualError { err: Custom { kind: NotFound, error: "The system cannot find the file specified." }, context: [{ ident: "OPEN_CONFIG_FILE" }] }"#);
//         assert_eq!(format!("{}", result), "Context:\n    OPEN_CONFIG_FILE\nSource: The system cannot find the file specified.");
//     }
//
//     #[test]
//     fn test_multiple_context() {
//         let test_err = std::io::Error::new(
//             std::io::ErrorKind::NotFound,
//             "The system cannot find the file specified.");
//         let result =
//             add_context_fn!("LOAD_CONFIG")(
//                 add_context_fn!("OPEN_CONFIG_FILE", "configPath": "/config/path")(test_err)
//             );
//
//         assert_eq!(format!("{:?}", result),
//             r#"ContextualError { err: Custom { kind: NotFound, error: "The system cannot find the file specified." }, context: [{ ident: "LOAD_CONFIG" }, { ident: "OPEN_CONFIG_FILE", "configPath": "/config/path" }] }"#);
//         assert_eq!(format!("{}", result),
//             "Context:\n    LOAD_CONFIG\n    OPEN_CONFIG_FILE|configPath=/config/path\nSource: The system cannot find the file specified.");
//     }
//
//
// }
