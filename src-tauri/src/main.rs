// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
pub mod handlers;
pub mod streamers;
pub mod monitors;

fn main() {
    monitors::initialize_monitors();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
          handlers::cpu::get_cpu_information
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
