use std::{collections::HashMap, sync::{Mutex, Arc}, ops::{Deref, DerefMut}};

use tauri::State;

pub mod cpu;
pub mod memory;
pub mod process;

#[derive(PartialEq, Eq, Hash)]
pub enum StreamEvent{
    CpuMulticoreHistoricalUsage,
    CpuSinglecoreCurrentUsage,
    SystemInformation,
    MemoryHistoricalUsage,
    CurrentMemoryUsage,
    CurrentSwapUsage,
    CurrentRunningProcesses
}

macro_rules! generate_counters {
    ($($variant:ident),*) => {{
        let mut counter: HashMap<StreamEvent, Mutex<u8>> = HashMap::new();
        $(
            counter.insert(StreamEvent::$variant, Mutex::new(0));
        )*
        counter
    }};
}

impl StreamEvent{
    pub fn as_str(& self) -> &'static str{
        match self{
            Self::CpuMulticoreHistoricalUsage => "cpu_multicore_historical_usage",
            Self::CpuSinglecoreCurrentUsage => "cpu_singlecore_current_usage",
            Self::SystemInformation => "system_information",
            Self::MemoryHistoricalUsage => "memory_historical_usage",
            Self::CurrentMemoryUsage => "current_memory_usage",
            Self::CurrentSwapUsage => "current_swap_usage",
            Self::CurrentRunningProcesses => "current_running_processes"
        }
    }
    pub fn get_counters() -> HashMap<StreamEvent, Mutex<u8>> {
        generate_counters!(
            CpuMulticoreHistoricalUsage,
            CpuSinglecoreCurrentUsage,
            SystemInformation,
            MemoryHistoricalUsage,
            CurrentMemoryUsage,
            CurrentSwapUsage,
            CurrentRunningProcesses
        )
        // DO NOT REMOVE THIS COMMENT
        //TODO: If you modify the StreamEvent enum, make sure to update this function.
        // Add/remove variants as needed.
    }
}

/// Extract the mutex that contains the counter from the state hashmap.
fn get_counter_mutex_from_state<'a>(stream_event_kind: &'a StreamEvent,  counters_state: State<'a, Arc<HashMap<StreamEvent, Mutex<u8>>>>) -> &'a Mutex<u8>{
    //extract the hashmap
    let counters = {
      let c = (counters_state).inner();
      c.deref()
    };
    //get the counter mutex from the hashmap
    let listeners_count = {
        counters
            .get(stream_event_kind)
            //Do not remove the this unwrap, it enforces us to insert a counter in the state hashmap
            //for each variant of StreamEvent
            .unwrap()
    };
    listeners_count
}

pub enum StreamEventAction{
    StartStream,
    StopStream,
    None
}
/// Increments the counter inside the mutex and returns true if the counter > 1 after the increment.
/// True means that there's already a thread streaming the information the counter refers to
fn increment_counter_and_check(counter_mutex: &Mutex<u8>) -> StreamEventAction{
    let count = {
        //TODO: handle unwrap
        let mut counter = counter_mutex.lock().unwrap();
        let counter = counter.deref_mut();
        *counter = *counter + 1u8;
        *counter
    };
    if count > 1 {
        return StreamEventAction::None;
    }
    StreamEventAction::StartStream
}

fn check_counter(counter_mutex: &Mutex<u8>) -> StreamEventAction{
    let listeners_count = {
        let mut counter = counter_mutex
            .lock()
            .unwrap();
        let counter = counter.deref_mut();
        *counter
    };
    //if there's no component listenig anymore we end this thread by breaking the loop
    if listeners_count == 0 {
        return StreamEventAction::StopStream;
    }
    StreamEventAction::None
}

