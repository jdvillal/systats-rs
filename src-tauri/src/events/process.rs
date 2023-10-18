use std::{
    collections::HashMap,
    ops::DerefMut,
    sync::{Arc, Mutex},
};

use serde::{Deserialize, Serialize};
use sysinfo::{Pid, Process, ProcessExt, System, SystemExt};
use tauri::{State, Window};

use super::{
    check_counter, get_counter_mutex_from_state, increment_counter_and_check, StreamEvent,
    StreamEventAction,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessInformation {
    pub pid: usize,
    pub parent_pid: Option<usize>,
    pub parent_name: Option<String>,
    pub name: String,
    pub executable_path: String,
    pub status: String,
    pub cpu_usage: f32,
    pub memory_usage: u64,
    pub virtual_memory_usage: u64,
    pub children_processes: Vec<ChildProcessInformation>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChildProcessInformation {
    pid: usize,
    name: String,
}

#[inline]
fn return_process_information(
    processes: &HashMap<Pid, Process>,
    key: &Pid,
    cpus_count: usize,
) -> ProcessInformation {
    let mut process = ProcessInformation {
        pid: processes.get(key).unwrap().pid().into(),
        parent_pid: match processes.get(key).unwrap().parent() {
            Some(p) => Some(p.into()),
            None => None,
        },
        parent_name: match processes.get(key).unwrap().parent() {
            Some(parent_pid) => {
                let parent_process = processes.get(&parent_pid);
                if parent_process.is_none() {
                    None
                } else {
                    Some(parent_process.unwrap().name().into())
                }
            }
            None => None,
        },
        name: processes.get(key).unwrap().name().to_owned(),
        executable_path: match processes.get(key).unwrap().exe().to_str() {
            Some(str) => str.to_owned(),
            None => "".to_owned(),
        },
        status: processes.get(key).unwrap().status().to_string(),
        cpu_usage: processes.get(key).unwrap().cpu_usage() / cpus_count as f32,
        memory_usage: processes.get(key).unwrap().memory(),
        virtual_memory_usage: processes.get(key).unwrap().virtual_memory(),
        children_processes: Vec::new(),
    };
    let mut children: Vec<ChildProcessInformation> = Vec::new();
    for (child_pid, child_process) in processes {
        if child_process.parent().is_some() {
            let parent_pid: usize = child_process.parent().unwrap().into();
            if parent_pid == process.pid {
                let child_info = ChildProcessInformation {
                    pid: (*child_pid).into(),
                    name: child_process.name().into(),
                };
                children.push(child_info);
            }
        }
    }
    process.children_processes = children;
    process
}



#[tauri::command]
pub fn emit_current_running_processes(
    window: Window,
    counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>,
) {
    let stream_event_kind = StreamEvent::CurrentRunningProcesses;
    let listeners_count = Arc::clone(counters_state.inner());
    let counter_mutex = get_counter_mutex_from_state(&stream_event_kind, counters_state);
    match increment_counter_and_check(counter_mutex) {
        StreamEventAction::StartStream => (),
        _ => return,
    }
    std::thread::spawn(move || {
        let mut sys = System::new_all();
        sys.refresh_cpu();
        let cpus_count = sys.cpus().len();
        sys.refresh_processes();
        loop {
            sys.refresh_processes();
            let processes = sys.processes();

            let mut processes_list: Vec<ProcessInformation> = Vec::new();
            for key in processes.keys() {
                let process = return_process_information(processes, key, cpus_count);
                processes_list.push(process);
            }
            processes_list.sort_unstable_by_key(|process| process.pid);
            /* if order_by == "pid" {
                processes_list.sort_unstable_by_key(|process| process.pid);
            } else if order_by == "parent_pid" {
                processes_list.sort_unstable_by_key(|process| process.parent_pid);
            } else if order_by == "cpu_usage" {
                processes_list
                    .sort_unstable_by_key(|process| (process.cpu_usage * 1000000 as f32) as i32);
            } else if order_by == "memory_usage" {
                processes_list.sort_unstable_by_key(|process| process.memory_usage);
            } else if order_by == "process_name" {
                processes_list.sort_unstable_by_key(|process| process.name.clone().to_lowercase());
            } else {
                processes_list.sort_unstable_by_key(|process| process.pid);
            } */

            window.emit(stream_event_kind.as_str(), processes_list).unwrap();
            
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
pub fn stop_current_running_processes(counters_state: State<Arc<HashMap<StreamEvent, Mutex<u8>>>>) {
    let mut counter = counters_state
        .inner()
        .get(&StreamEvent::CurrentRunningProcesses)
        .unwrap() // Should never panic if a counter for each variant (key) was inserted when created
        .lock()
        .unwrap();
    let counter = counter.deref_mut();
    *counter = *counter - 1u8;
}
