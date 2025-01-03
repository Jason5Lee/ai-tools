use crate::log_error;
use tauri::Manager;
use tracing::instrument;
use std::sync;
use std::sync::Arc;

#[derive(Default, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    open_ai_api_key: Option<String>,
    http_proxy: Option<String>,
}

pub struct ConfigState(pub sync::Mutex<Arc<Config>>);

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

#[tauri::command]
#[instrument(level = "info", skip(handle))]
pub fn get_config(handle: tauri::AppHandle) -> Arc<Config> {
    handle.state::<ConfigState>()
        .0
        .lock()
        .unwrap()
        .clone()
}

#[tauri::command]
#[instrument(level = "info", skip(handle, config))]
pub fn save_config(handle: tauri::AppHandle, config: Config) -> Result<Arc<Config>, ()> {
    let mut config_path = handle.path().app_config_dir().map_err(log_error)?;
    std::fs::create_dir(&config_path).ok();
    config_path.push("config.json");

    let file = std::fs::File::create(&config_path).map_err(log_error)?;
    serde_json::to_writer(file, &config).map_err(log_error)?;
    let config = Arc::new(config);
    *handle.state::<ConfigState>()
        .0
        .lock()
        .unwrap() = config.clone();
    Ok(config)
}
