mod ask;

use ai_tools_common::*;
use std::path::PathBuf;
use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};

#[tauri::command]
async fn open_app(handle: tauri::AppHandle, name: String) -> Result<(), serde_json::Value> {
    let mut app_path = PathBuf::new();
    app_path.push(&name);
    app_path.push("index.html");

    if let Some(window) = handle.get_webview_window(&name) {
        window.set_focus().map_err(log_error)?;
    } else {
        tauri::WebviewWindowBuilder::new(&handle, &name, tauri::WebviewUrl::App(app_path))
            .build()
            .map_err(log_error)?;
    }

    Ok(())
}

#[tauri::command]
fn set_window_title(window: tauri::WebviewWindow, title: String) -> Result<(), serde_json::Value> {
    window.set_title(&title).map_err(log_error)
}

#[derive(Default, serde::Serialize, serde::Deserialize)]
struct Config {
    http_proxy: HttpProxyConfig,
}

#[derive(Default, serde::Serialize, serde::Deserialize)]
struct HttpProxyConfig {
    enabled: bool,
    url: String,
}

#[tauri::command]
fn load_config(handle: tauri::AppHandle) -> Result<Config, serde_json::Value> {
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
fn save_config(handle: tauri::AppHandle, config: Config) -> Result<(), serde_json::Value> {
    let mut config_path = handle.path().app_config_dir().map_err(log_error)?;
    config_path.push("config.json");

    // Should I use async file IO here?
    let file = std::fs::File::create(&config_path).map_err(log_error)?;

    serde_json::to_writer(file, &config).map_err(log_error)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                ])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            open_app,
            set_window_title,
            load_config,
            save_config,
            ask::ask_get_implementations,
            ask::ask_run_action,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
