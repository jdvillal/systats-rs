// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{sync::Arc, ops::Deref};

use handlers::combustor::{CombustorState, self};

pub mod handlers;
pub mod monitors;
pub mod streamers;

fn main() {
    let combustor_state_arc1 = Arc::new(CombustorState::new());
    let combustor_state_arc2 = Arc::clone(&combustor_state_arc1);
    let combustor_port = handlers::combustor::initialize_combustor_service(combustor_state_arc1).unwrap();
    _ = monitors::initialize_monitors();

    tauri::Builder::default()
        .manage(combustor_state_arc2)
        .manage(combustor_port)
        .invoke_handler(tauri::generate_handler![
            handlers::cpu::get_cpu_information,
            handlers::memory::get_memory_information,
            handlers::disk::get_system_disks_information,
            handlers::combustor::get_combustor_port,
            handlers::combustor::stop_combustor
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
