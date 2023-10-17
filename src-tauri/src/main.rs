// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{sync::{Arc,Mutex}, ops::{Deref, DerefMut}};

use systracker::{SystemTracker, cpu::{CpuTracker, CoreBuffer}, memory::{MemTracker, MemBuffer}};
use tauri::{State, Window};
use uuid::Uuid;
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

/// Try to start emitting cpu historical data updates
/// If the event is already being emmited it does nothing but to
/// increment the counter.
/// When the counter is set to 0 the thread will stop executing
#[tauri::command]
fn try_emit_cpu_updates(window: Window, state: State<Arc<Mutex<CpuTracker>>> , listeners_count: State<Arc<Mutex<u8>>>) {
  let tracker = Arc::clone(state.inner());
  let listeners_count = Arc::clone(listeners_count.inner());
  let count = {
    let mut counter = listeners_count.lock().unwrap();
    let counter = counter.deref_mut();
    *counter = *counter + 1u8;
    *counter
  };
  if count > 1{
    return;
  }
  std::thread::spawn(move || {
    loop {
      //window.emit("cpu_multicore_updated", Payload { message: "Tauri is awesome!".into() }).unwrap();
      let tracker = tracker.deref();
      let data: Option<Vec<CoreBuffer>> = {
        let mut tracker = match tracker.lock(){
          Ok(t) => t,
          Err(_) => continue
        };
        let tracker = tracker.deref_mut();
        tracker.fetch_usage()
      };
      
      // get the corrent listeners counter
      let listeners_count = {
        let mut counter = listeners_count.lock().unwrap();
        let counter = counter.deref_mut();
        *counter
      };
      //if there's no component listenig anymore we end this thread by breaking the loop
      if listeners_count == 0{
        break;
      }
      window.emit("cpu_update", data.unwrap()).unwrap();

      std::thread::sleep(std::time::Duration::from_millis(500));
    }
  });
}

/// Try to stop emitting CPU historical data updates by decreasing the counter
#[tauri::command]
fn try_stop_emitting_cpu_updates(listeners_count: State<Arc<Mutex<u8>>>){
  let mut counter = listeners_count.inner().lock().unwrap();
  let counter = counter.deref_mut();
  *counter = *counter - 1u8;
}


// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct MemHistPayload {
  //message: String
  message: MemBuffer
}

#[tauri::command]
fn emit_memory_updates(window: Window, state: State<Arc<Mutex<MemTracker>>>, listeners_count: State<Arc<Mutex<u8>>>) {
  let tracker = Arc::clone(state.inner());
  let listeners_count = Arc::clone(listeners_count.inner());
  let count = {
    let mut counter = listeners_count.lock().unwrap();
    let counter = counter.deref_mut();
    *counter = *counter + 1u8;
    *counter
  };
  if count > 1{
    return;
  }
  std::thread::spawn(move || {
    loop {
      //window.emit("cpu_multicore_updated", Payload { message: "Tauri is awesome!".into() }).unwrap();
      let tracker = tracker.deref();
      let data: Option<MemBuffer> = {
        let mut tracker = match tracker.lock(){
          Ok(t) => t,
          Err(_) => continue
        };
        let tracker = tracker.deref_mut();
        tracker.fetch_usage()
      };
      // get the corrent listeners counter
      let listeners_count = {
        let mut counter = listeners_count.lock().unwrap();
        let counter = counter.deref_mut();
        *counter
      };
      //if there's no component listenig anymore we end this thread by breaking the loop
      if listeners_count == 0{
        break;
      }
      window.emit("mem_update", MemHistPayload { message: data.unwrap() }).unwrap();
      std::thread::sleep(std::time::Duration::from_millis(500));
    }
  });
}

fn main() {
    let session_id = Arc::new(Uuid::new_v4());
    monitors::initialize_monitors(Arc::clone(&session_id));

    // Create a CPU tracker that records the last 60 seconds of CPU usage
    let cpu_tracker = SystemTracker::new_cpu_tracker();
    // Atomic counter to keep track of the amount of components that are currently listening to the event
    let cpu_listeners_counter: Arc<Mutex<u8>> = Arc::new(Mutex::new(0));

    let memory_tracker = SystemTracker::new_mem_tracker();
    let memory_listener_counter: Arc<Mutex<u8>> = Arc::new(Mutex::new(0));
    
    tauri::Builder::default()
        .manage(session_id)
        .manage(Arc::new(Mutex::new(cpu_tracker)))
        .manage(cpu_listeners_counter)
        .manage(Arc::new(Mutex::new(memory_tracker)))
        //.manage(memory_listener_counter)
        .invoke_handler(tauri::generate_handler![
            handlers::get_app_session_id,
            handlers::cpu::get_cpu_information,
            handlers::memory::get_memory_information,
            handlers::disk::get_system_disks_information,
            handlers::disk::get_filetree_from_path,
            handlers::disk::get_treemap_from_path,
            try_emit_cpu_updates,
            try_stop_emitting_cpu_updates,
            //emit_memory_updates
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
