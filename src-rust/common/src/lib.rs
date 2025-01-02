pub use smol_str;
use std::backtrace::BacktraceStatus;
use std::fmt::{Display, Formatter};
pub type Str = smol_str::SmolStr;

pub fn log_error<E: Display>(err: E) {
    log::error!("{err}");
}

#[derive(serde::Serialize)]
pub struct Implementation {
    pub ident: Str,
    pub available: Option<bool>,
}

pub fn unknown_method_error() -> serde_json::Value {
    let mut map = serde_json::Map::new();
    map.insert("ident".into(), "UNKNOWN_METHOD".into()).unwrap();
    serde_json::Value::Object(map)
}
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
