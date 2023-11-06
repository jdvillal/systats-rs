// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{sync::{Arc, Mutex, RwLock}, collections::HashMap};

use events::StreamEvent;
use monitors::process::{ProcessHistory, start_processes_monitor};
use systracker::SystemTracker;

use uuid::Uuid;
pub mod events;
pub mod handlers;
pub mod monitors;
pub mod streamers;
pub mod systracker;

fn main() {
    let session_id = Arc::new(Uuid::new_v4());

    // Create a CPU tracker that records the last 60 seconds of CPU usage
    let cpu_tracker = SystemTracker::new_cpu_tracker();
    // Create a Memory tracker that records the last 60 seconds of Memory usage
    let memory_tracker = SystemTracker::new_mem_tracker();

    // Start a thread that records the last 60 seconds of each process resource usage
    let recorded_processes: HashMap<usize, ProcessHistory> = HashMap::new();
    let recorded_processes_arc = Arc::new(RwLock::new(recorded_processes));
    start_processes_monitor(Arc::clone(&recorded_processes_arc));

    let state_counters = StreamEvent::get_counters();

    tauri::Builder::default()
        .manage(session_id)
        .manage(Arc::new(state_counters))
        .manage(Arc::clone(&recorded_processes_arc))
        .manage(Arc::new(Mutex::new(cpu_tracker)))
        .manage(Arc::new(Mutex::new(memory_tracker)))
        .invoke_handler(tauri::generate_handler![
            handlers::get_app_session_id,
            handlers::cpu::get_cpu_information,
            handlers::memory::get_memory_information,
            handlers::disk::get_system_disks_information,
            handlers::disk::get_filetree_from_path,
            handlers::disk::get_treemap_from_path,
            events::cpu::emit_cpu_mulitcore_historical_usage,
            events::cpu::stop_cpu_mulitcore_historical_usage,
            events::cpu::emit_cpu_singlecore_current_usage,
            events::cpu::stop_cpu_singlecore_current_usage,
            events::cpu::emit_system_information,
            events::cpu::stop_system_information,
            events::memory::emit_memory_historical_usage,
            events::memory::stop_memory_historical_usage,
            events::memory::emit_current_memory_usage,
            events::memory::stop_current_memory_usage,
            events::memory::emit_current_swap_usage,
            events::memory::stop_current_swap_usage,
            events::process::emit_current_running_processes,
            events::process::stop_current_running_processes,
            events::process::emit_process_historical_resource_usage,
            events::process::stop_process_historical_resource_usage,
            events::process::emit_process_information,
            events::process::stop_process_information
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
