// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
    sync::{Arc, Mutex},
};

use events::StreamEvent;
use systracker::{
    cpu::{CoreBuffer, CpuTracker},
    memory::{MemBuffer, MemTracker},
    SystemTracker,
};
use tauri::{State, Window};
use uuid::Uuid;
pub mod events;
pub mod handlers;
pub mod monitors;
pub mod streamers;
pub mod systracker;

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
    //message: String
    message: Vec<CoreBuffer>,
}

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct MemHistPayload {
    //message: String
    message: MemBuffer,
}

#[tauri::command]
fn emit_memory_updates(
    window: Window,
    state: State<Arc<Mutex<MemTracker>>>,
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let tracker = Arc::clone(state.inner());
    let counters = {
        let mut c = (counters_state).inner();
        let c = c.deref();
        c
    };
    //get the counter mutex from the hashmap
    let listeners_count = {
        counters
            .get(&StreamEvent::CpuMulticoreHistoricalUsage)
            .unwrap()
    };
    let count = {
        let mut counter = listeners_count.lock().unwrap();
        let counter = counter.deref_mut();
        *counter = *counter + 1u8;
        *counter
    };
    if count > 1 {
        return;
    }
    let listeners_count = Arc::clone(counters_state.inner());
    std::thread::spawn(move || {
        loop {
            //window.emit("cpu_multicore_updated", Payload { message: "Tauri is awesome!".into() }).unwrap();
            let tracker = tracker.deref();
            let data: Option<MemBuffer> = {
                let mut tracker = match tracker.lock() {
                    Ok(t) => t,
                    Err(_) => continue,
                };
                let tracker = tracker.deref_mut();
                tracker.fetch_usage()
            };
            // get the corrent listeners counter
            let listeners_count = {
                let mut counter = listeners_count
                    .get(&StreamEvent::CpuMulticoreHistoricalUsage)
                    .unwrap()
                    .lock()
                    .unwrap();
                let counter = counter.deref_mut();
                *counter
            };
            //if there's no component listenig anymore we end this thread by breaking the loop
            if listeners_count == 0 {
                break;
            }
            window
                .emit(
                    "mem_update",
                    MemHistPayload {
                        message: data.unwrap(),
                    },
                )
                .unwrap();
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

fn main() {
    let session_id = Arc::new(Uuid::new_v4());
    monitors::initialize_monitors(Arc::clone(&session_id));

    // Create a CPU tracker that records the last 60 seconds of CPU usage
    let cpu_tracker = SystemTracker::new_cpu_tracker();
    let memory_tracker = SystemTracker::new_mem_tracker();

    let state_counters = StreamEvent::get_counters();

    tauri::Builder::default()
        .manage(session_id)
        .manage(Arc::new(state_counters))
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
            events::cpu::stop_system_information
            //emit_memory_updates
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
