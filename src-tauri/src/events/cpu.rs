use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
    sync::{Arc, Mutex},
};

use serde::Serialize;
use sysinfo::{CpuExt, System, SystemExt};
use tauri::{State, Window};

use crate::systracker::cpu::{CoreBuffer, CpuTracker};

use super::{
    check_counter, get_counter_mutex_from_state, increment_counter_and_check, StreamEvent,
    StreamEventAction,
};

/// Try to start emitting cpu historical data updates.
/// If the event is already being emmited it does nothing but to
/// increment its listeners counter.
/// When the counter is set to 0 the thread will stop executing
#[tauri::command]
pub fn emit_cpu_mulitcore_historical_usage(
    window: Window,
    state: State<Arc<Mutex<CpuTracker>>>,
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let stream_event_kind = StreamEvent::CpuMulticoreHistoricalUsage;
    let tracker = Arc::clone(state.inner());
    let listeners_count = Arc::clone(counters_state.inner());
    let counter_mutex = get_counter_mutex_from_state(&stream_event_kind, counters_state);
    match increment_counter_and_check(counter_mutex) {
        StreamEventAction::StartStream => (),
        _ => return,
    }
    std::thread::spawn(move || {
        loop {
            //window.emit("cpu_multicore_updated", Payload { message: "Tauri is awesome!".into() }).unwrap();
            let tracker = tracker.deref();
            let data: Option<Vec<CoreBuffer>> = {
                let mut tracker = match tracker.lock() {
                    Ok(t) => t,
                    Err(_) => continue,
                };
                let tracker = tracker.deref_mut();
                tracker.fetch_usage()
            };
            window
                .emit(stream_event_kind.as_str(), data.unwrap())
                .unwrap();

            // get the current counter mutex
            let counter_mutex = {
                listeners_count.get(&stream_event_kind).unwrap() // Should never panic if a counter for each variant (key) was inserted when created
            };
            //if there's no component listenig anymore we end this thread by breaking the loop
            match check_counter(counter_mutex) {
                StreamEventAction::StopStream => break,
                _ => (),
            }

            //TODO: calc time elapsed
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

/// Try to stop emitting CPU historical data updates by decreasing the counter
#[tauri::command]
pub fn stop_cpu_mulitcore_historical_usage(
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let mut counter = counters_state
        .inner()
        .get(&StreamEvent::CpuMulticoreHistoricalUsage)
        .unwrap() // Should never panic if a counter for each variant (key) was inserted when created
        .lock()
        .unwrap();
    let counter = counter.deref_mut();
    *counter = *counter - 1u8;
}

/// Try to start emitting cpu current usage updates
/// If the event is already being emmited it does nothing but to
/// increment the counter.
/// When the counter is set to 0 the thread will stop executing
#[tauri::command]
pub fn emit_cpu_singlecore_current_usage(
    window: Window,
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let stream_event_kind = StreamEvent::CpuSinglecoreCurrentUsage;
    let listeners_count = Arc::clone(counters_state.inner());
    let counter_mutex = get_counter_mutex_from_state(&stream_event_kind, counters_state);
    match increment_counter_and_check(counter_mutex) {
        StreamEventAction::StartStream => (),
        _ => return,
    }
    std::thread::spawn(move || {
        let mut sys = System::new_all();
        loop {
            sys.refresh_cpu();
            let mut data = 0f32;
            for cpu in sys.cpus() {
                data += cpu.cpu_usage();
            }
            data = data / sys.cpus().len() as f32;
            window
                .emit(stream_event_kind.as_str(), data)
                .unwrap();

            // get the current counter mutex
            let counter_mutex = {
                listeners_count.get(&stream_event_kind).unwrap() // Should never panic if a counter for each variant (key) was inserted when created
            };
            //if there's no component listenig anymore we end this thread by breaking the loop
            match check_counter(counter_mutex) {
                StreamEventAction::StopStream => break,
                _ => (),
            }
            //TODO: calc time elapsed
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

/// Decrease the counter to stop emiting the data if necesary (counter == 0).
#[tauri::command]
pub fn stop_cpu_singlecore_current_usage(
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let mut counter = counters_state
        .inner()
        .get(&StreamEvent::CpuSinglecoreCurrentUsage)
        .unwrap() // Should never panic if a counter for each variant (key) was inserted when created
        .lock()
        .unwrap();
    let counter = counter.deref_mut();
    *counter = *counter - 1u8;
}



#[derive(Serialize)]
pub struct SystemStateInfo{
    frequency: u64,
    running_processes: usize,
    avg_load_one: f64,
    avg_load_five: f64,
    avg_load_fifteen: f64,
    uptime: u64,
    boot_time: u64,
    distribution_id: String,
    os_version: Option<String>
}

/// Try to start emitting system information updates
/// If the event is already being emmited it does nothing but to
/// increment the counter.
/// When the counter is set to 0 the thread will stop executing
#[tauri::command]
pub fn emit_system_information(
    window: Window,
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let stream_event_kind = StreamEvent::SystemInformation;
    let listeners_count = Arc::clone(counters_state.inner());
    let counter_mutex = get_counter_mutex_from_state(&stream_event_kind, counters_state);
    match increment_counter_and_check(counter_mutex) {
        StreamEventAction::StartStream => (),
        _ => return,
    }
    std::thread::spawn(move || {
        let mut sys = System::new_all();
        loop {
          sys.refresh_all();
        
          let mut max_freq = 0;
          for cpu in sys.cpus(){
              if cpu.frequency() > max_freq {
                  max_freq = cpu.frequency();
              }
          }
          let sys_state_info = SystemStateInfo{
              frequency: max_freq,
              running_processes: sys.processes().len(),
              avg_load_one: sys.load_average().one,
              avg_load_five: sys.load_average().five,
              avg_load_fifteen: sys.load_average().fifteen,
              uptime: sys.uptime(),
              boot_time: sys.boot_time(),
              distribution_id: sys.distribution_id(),
              os_version: sys.os_version()
          };
          let resp_msg = serde_json::to_string(&sys_state_info).unwrap();
            window
                .emit(stream_event_kind.as_str(), resp_msg)
                .unwrap();

            // get the current counter mutex
            let counter_mutex = {
                listeners_count.get(&stream_event_kind).unwrap() // Should never panic if a counter for each variant (key) was inserted when created
            };
            //if there's no component listenig anymore we end this thread by breaking the loop
            match check_counter(counter_mutex) {
                StreamEventAction::StopStream => break,
                _ => (),
            }
            //TODO: calc time elapsed
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

/// Decrease the counter to stop emiting the data if necesary (counter == 0).
#[tauri::command]
pub fn stop_system_information(
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let mut counter = counters_state
        .inner()
        .get(&StreamEvent::SystemInformation)
        .unwrap() // Should never panic if a counter for each variant (key) was inserted when created
        .lock()
        .unwrap();
    let counter = counter.deref_mut();
    *counter = *counter - 1u8;
}