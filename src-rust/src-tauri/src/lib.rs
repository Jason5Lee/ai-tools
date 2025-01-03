mod ask;
mod config;

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
fn set_window_title(window: tauri::WebviewWindow, title: String) -> Result<(), ()> {
    window.set_title(&title).map_err(log_error)
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
        .setup(|app| {
            let conf = config::load_config(app.handle())
                .map_err(|()| Box::<dyn std::error::Error>::from("Failed to read config"))?;

            app.manage(config::ConfigState(std::sync::Mutex::new(std::sync::Arc::new(conf))));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_app,
            set_window_title,
            config::get_config,
            config::save_config,
            ask::ask_get_implementations,
            ask::ask_run_action,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
