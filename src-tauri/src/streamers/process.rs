use std::{net::TcpStream, collections::HashMap, time::Instant};

use serde::{Serialize, Deserialize};
use sysinfo::{System, SystemExt, ProcessExt, Process, Pid};
use tungstenite::WebSocket;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessInformation{
    pub pid: usize,
    pub parent_pid: Option<usize>,
    pub name: String,
    pub executable_path: String,
    pub status: String,
    pub cpu_usage: f32,
    pub memory_usage: u64,
    pub virtual_memory_usage: u64,
    pub timelapse_cpu_usage: Option<Vec<f32>>,
    pub timelapse_memory_usage: Option<Vec<u64>>,
    pub children_processes: Vec<ProcessInformation>
}

pub fn return_process_information(processes: &HashMap<Pid, Process>, key: &Pid, cpus_count: usize) -> ProcessInformation{
    let process = ProcessInformation{
        pid: processes.get(key).unwrap().pid().into(),
        parent_pid: match processes.get(key).unwrap().parent(){
            Some(p) => {
                let pid: usize = p.into();
                Some(pid)
            },
            None => None,
        },
        name: processes.get(key).unwrap().name().to_owned(),
        executable_path: match  processes.get(key).unwrap().exe().to_str(){
            Some(str) => str.to_owned(),
            None => "".to_owned(),
        },
        status: processes.get(key).unwrap().status().to_string(),
        cpu_usage: processes.get(key).unwrap().cpu_usage() / cpus_count as f32,
        memory_usage: processes.get(key).unwrap().memory(),
        virtual_memory_usage: processes.get(key).unwrap().virtual_memory(),
        children_processes: Vec::new(),
        timelapse_cpu_usage: Some(Vec::new()),
        timelapse_memory_usage: Some(Vec::new()),
    };
    process
}


pub fn handle_current_processes_websocket(
    mut websocket: WebSocket<TcpStream>,
) {
    
    let mut sys = System::new_all();
    sys.refresh_cpu();
    let cpus_count = sys.cpus().len();
    sys.refresh_processes();
    loop {
        let now = Instant::now();
        let msg: String = websocket.read().unwrap().to_string();
        //let msg = "pid";
        sys.refresh_processes();
        let processes = sys.processes();

        let mut processes_list: Vec<ProcessInformation> = Vec::new();
        for key in processes.keys(){
            let process = return_process_information(processes, key, cpus_count);
            processes_list.push(process);
        }
        if msg == "pid" {
            processes_list.sort_unstable_by_key(|process| process.pid);
        } else if msg == "parent_pid" {
            processes_list.sort_unstable_by_key(|process| process.parent_pid);
        } else if msg == "cpu_usage" {
            processes_list.sort_unstable_by_key(|process| (process.cpu_usage * 1000000 as f32) as i32);
        } else if msg == "memory_usage" {
            processes_list.sort_unstable_by_key(|process| process.memory_usage);
        } else if msg == "process_name" {
            processes_list.sort_unstable_by_key(|process| process.name.clone().to_lowercase());
        }else{
            processes_list.sort_unstable_by_key(|process| process.pid);
        }
        
        let response = serde_json::to_string(&processes_list).unwrap();
        //println!("{}", &response);
        
        let res = websocket.send(response.into());
        match res {
            Ok(_r) => {}
            Err(_e) => {
                break;
            }
        }
        println!("{}", now.elapsed().as_millis());
        //TODO: break loop when socket connection ends
        std::thread::sleep(std::time::Duration::from_millis(5000));
    }
}