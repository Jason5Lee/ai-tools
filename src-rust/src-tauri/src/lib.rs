use ai_tools_common::futures_util::stream::StreamExt;
mod ask;
mod config;

use std::path::PathBuf;
use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};
use tracing_subscriber::layer::SubscriberExt;
use ai_tools_common::tracing::error;
pub use ai_tools_common::AppState;
use ai_tools_common::{log_error, Manual, RunActionOutput, RunActionResult};

async fn translate_run_action_result(
    original_result: RunActionResult,
    channel: tauri::ipc::Channel<String>,
) -> Result<Option<Manual>, ()> {
    match original_result? {
        RunActionOutput::Response(mut response) => {
            while let Some(text) = response.next().await {
                let text = text?;
                channel
                    .send(text)
                    .map_err(|err| error!("Failed to send message to channel, {err}"))?
            }

            Ok(None)
        }
        RunActionOutput::Manual(manual ) => {
            Ok(Some(manual))
        }
    }
}

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
            let filter = tracing_subscriber::EnvFilter::from_default_env();
            let layer = tracing_tree::HierarchicalLayer::default()
                .with_indent_lines(true)
                .with_ansi(true)
                .with_targets(true)
                .with_indent_amount(2);
            let subscriber = tracing_subscriber::Registry::default()
                .with(filter)
                .with(layer);
            ai_tools_common::tracing::subscriber::set_global_default(subscriber).unwrap();

            let conf = config::load_config(app.handle())
                .map_err(|()| Box::<dyn std::error::Error>::from("Failed to read config"))?;

            app.manage(AppState::new(conf));
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
