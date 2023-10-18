use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
    sync::{Arc, Mutex},
};

use sysinfo::{System, SystemExt};
use tauri::{State, Window};

use crate::systracker::memory::{MemBuffer, MemTracker};

use super::{
    get_counter_mutex_from_state, increment_counter_and_check, StreamEvent, StreamEventAction, check_counter,
};


#[tauri::command]
pub fn emit_memory_historical_usage(
    window: Window,
    state: State<Arc<Mutex<MemTracker>>>,
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let stream_event_kind = StreamEvent::MemoryHistoricalUsage;
    let tracker = Arc::clone(state.inner());
    let listeners_count = Arc::clone(counters_state.inner());
    let counter_mutex = get_counter_mutex_from_state(&stream_event_kind, counters_state);
    match increment_counter_and_check(counter_mutex) {
        StreamEventAction::StartStream => (),
        _ => return,
    }
    std::thread::spawn(move || {
        loop {
            let tracker = tracker.deref();
            let data: Option<MemBuffer> = {
                let mut tracker = match tracker.lock() {
                    Ok(t) => t,
                    Err(_) => continue,
                };
                let tracker = tracker.deref_mut();
                tracker.fetch_usage()
            };
            window
                // The tracker only returns None after been stoped, wich should never happend
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
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

/// Try to stop emitting CPU historical data updates by decreasing the counter
#[tauri::command]
pub fn stop_memory_historical_usage(
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let mut counter = counters_state
        .inner()
        .get(&StreamEvent::MemoryHistoricalUsage)
        .unwrap() // Should never panic if a counter for each variant (key) was inserted when created
        .lock()
        .unwrap();
    let counter = counter.deref_mut();
    *counter = *counter - 1u8;
}



#[tauri::command]
pub fn emit_current_memory_usage(
    window: Window,
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let stream_event_kind = StreamEvent::CurrentMemoryUsage;
    let listeners_count = Arc::clone(counters_state.inner());
    let counter_mutex = get_counter_mutex_from_state(&stream_event_kind, counters_state);
    match increment_counter_and_check(counter_mutex) {
        StreamEventAction::StartStream => (),
        _ => return,
    }
    std::thread::spawn(move || {
        let mut sys = System::new_all();
        loop {
            sys.refresh_memory();
            
            window
                // The tracker only returns None after been stoped, wich should never happend
                .emit(stream_event_kind.as_str(), sys.used_memory())
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
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

/// Try to stop emitting CPU historical data updates by decreasing the counter
#[tauri::command]
pub fn stop_curent_memory_usage(
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let mut counter = counters_state
        .inner()
        .get(&StreamEvent::CurrentMemoryUsage)
        .unwrap() // Should never panic if a counter for each variant (key) was inserted when created
        .lock()
        .unwrap();
    let counter = counter.deref_mut();
    *counter = *counter - 1u8;
}



#[tauri::command]
pub fn emit_current_swap_usage(
    window: Window,
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let stream_event_kind = StreamEvent::CurrentSwapUsage;
    let listeners_count = Arc::clone(counters_state.inner());
    let counter_mutex = get_counter_mutex_from_state(&stream_event_kind, counters_state);
    match increment_counter_and_check(counter_mutex) {
        StreamEventAction::StartStream => (),
        _ => return,
    }
    std::thread::spawn(move || {
        let mut sys = System::new_all();
        loop {
            sys.refresh_memory();
            
            window
                // The tracker only returns None after been stoped, wich should never happend
                .emit(stream_event_kind.as_str(), sys.used_swap())
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
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

/// Try to stop emitting CPU historical data updates by decreasing the counter
#[tauri::command]
pub fn stop_curent_swap_usage(
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let mut counter = counters_state
        .inner()
        .get(&StreamEvent::CurrentSwapUsage)
        .unwrap() // Should never panic if a counter for each variant (key) was inserted when created
        .lock()
        .unwrap();
    let counter = counter.deref_mut();
    *counter = *counter - 1u8;
}