use crate::log_error;
use ai_tools_common::tracing::instrument;
use ai_tools_common::{tracing, AppState};
use std::sync::Arc;
use tauri::Manager;

pub use ai_tools_common::config::Config;

#[instrument(name = "load_config (command)", skip(handle))]
pub fn load_config(handle: &tauri::AppHandle) -> Result<Config, ()> {
    let dir = handle.path().app_config_dir().map_err(log_error)?;
    ai_tools_common::config::load_config_from_dir(dir)
}

#[tauri::command]
#[instrument(name = "get_config (command)", skip(handle))]
pub fn get_config(handle: tauri::AppHandle) -> Arc<Config> {
    handle.state::<AppState>().get_config()
}

#[tauri::command]
#[instrument(name = "save_config (command)", skip(handle, config))]
pub fn save_config(handle: tauri::AppHandle, config: Config) -> Result<Arc<Config>, ()> {
    let dir = handle.path().app_config_dir().map_err(log_error)?;
    ai_tools_common::config::save_config_to_dir(&handle.state::<AppState>(), dir, config)
}
