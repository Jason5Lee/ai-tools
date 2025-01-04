// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tracing_subscriber::layer::SubscriberExt;

fn main() {
    ai_tools_lib::run()
}
