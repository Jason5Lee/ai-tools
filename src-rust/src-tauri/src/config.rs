use crate::log_error;
use tauri::Manager;
use tracing::instrument;

#[derive(Default, serde::Serialize, serde::Deserialize)]
struct HttpProxyConfig {
    enabled: bool,
    url: String,
}

#[derive(Default, serde::Serialize, serde::Deserialize)]
#[serde(rename = "camelCase")]
pub struct Config {
    open_ai_key: Option<String>,
    http_proxy: HttpProxyConfig,
}

#[instrument(level = "info")]
pub fn load_config(handle: &tauri::AppHandle) -> Result<Config, ()> {
    let mut config_path = handle.path().app_config_dir().map_err(log_error)?;
    config_path.push("config.json");
    // Should I use async file IO here?
    match std::fs::File::open(&config_path) {
        Ok(file) => serde_json::from_reader(file).map_err(log_error),
        Err(err) => {
            if err.kind() == std::io::ErrorKind::NotFound {
                Ok(Config::default())
            } else {
                Err(log_error(err))
            }
        }
    }
}

#[instrument(level = "info", skip(handle, config))]
pub fn save_config(handle: &tauri::AppHandle, config: &Config) -> Result<(), ()> {
    let mut config_path = handle.path().app_config_dir().map_err(log_error)?;
    config_path.push("config.json");

    let file = std::fs::File::create(&config_path).map_err(log_error)?;

    serde_json::to_writer(file, config).map_err(log_error)
}
