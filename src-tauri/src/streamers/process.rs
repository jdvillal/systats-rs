use std::{net::TcpStream, collections::HashMap, sync::{RwLock, Arc}, ops::Deref, time::Duration};

use serde::{Serialize, Deserialize};
use serde_json::json;
use sysinfo::{System, SystemExt, ProcessExt, Process, Pid};
use tungstenite::WebSocket;

use crate::monitors::process::ProcessHistory;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessInformation{
    pub pid: usize,
    pub parent_pid: Option<usize>,
    pub parent_name: Option<String>,
    pub name: String,
    pub executable_path: String,
    pub status: String,
    pub cpu_usage: f32,
    pub memory_usage: u64,
    pub virtual_memory_usage: u64,
    pub children_processes: Vec<ChildProcessInformation>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChildProcessInformation{
    pid: usize,
    name: String
}

#[inline]
fn return_process_information(processes: &HashMap<Pid, Process>, key: &Pid, cpus_count: usize) -> ProcessInformation{
    let mut process = ProcessInformation{
        pid: processes.get(key).unwrap().pid().into(),
        parent_pid: match processes.get(key).unwrap().parent(){
            Some(p) => {
                Some(p.into())
            },
            None => None,
        },
        parent_name: match processes.get(key).unwrap().parent(){
            Some(parent_pid) => {
                let parent_process = processes.get(&parent_pid);
                if parent_process.is_none(){
                    None
                }else{
                    Some(parent_process.unwrap().name().into())
                }
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
    };
    let mut children: Vec<ChildProcessInformation> = Vec::new();
    for (child_pid, child_process) in processes{
        if child_process.parent().is_some(){
            let parent_pid: usize = child_process.parent().unwrap().into();
            if parent_pid == process.pid{
                let child_info = ChildProcessInformation{
                    pid: (*child_pid).into(),
                    name: child_process.name().into()
                };
                children.push(child_info);
            }
        }
    }
    process.children_processes = children;
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
        let msg: String = websocket.read().unwrap().to_string();
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
        //TODO: break loop when socket connection ends
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
}


pub fn handle_process_information_websocket(
    mut websocket: WebSocket<TcpStream>,
) {
    let msg: String = websocket.read().unwrap().to_string();
    //try parsing the pid
    let try_key: Result<usize, _> = msg.parse();
    let key = match try_key{
        Ok(k) => k,
        Err(_) => {
            //if not a valid pid connection is closed
            println!("NOT VALID PID");
            _ = websocket.close(None);
            return;
        }
    };
    let mut sys = System::new_all();
    sys.refresh_cpu();
    let cpus_count = sys.cpus().len();
    loop{
        let exists = sys.refresh_process(Pid::from(key));
        if exists{
            let process_info = return_process_information(sys.processes(), &Pid::from(key), cpus_count);
            let resp = json!(process_info);
            let resp = serde_json::to_string(&resp).unwrap();
            match websocket.send(resp.into()){
                Ok(_) => (),
                Err(_e) => break
            }
        }else{
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    _ = websocket.close(None);
}


pub fn handle_process_resource_usage_websocket(
    mut websocket: WebSocket<TcpStream>,
    recorded_processes: Arc<RwLock<HashMap<usize, ProcessHistory>>>
) {
    //the second received msg should be the pid of the process
    let msg: String = websocket.read().unwrap().to_string();
    //try parsing the pid
    let try_key: Result<usize, _> = msg.parse();
    let key = match try_key{
        Ok(k) => k,
        Err(_) => {
            //if not a valid pid connection is closed
            _ = websocket.close(None);
            return;
        }
    };

    loop{
        let process_hist: ProcessHistory = {
            let r = recorded_processes.read().unwrap();
            let data = r.deref();
            //println!("{:?}", data.keys());
            let try_process_info = data.get(&key);
            match try_process_info{
                Some(p) => {
                    let p = p.deref().clone();
                    p
                },
                None => {
                    println!("NOT FOUND");
                    break;
                }
            }
        };
    
        let msg = json!(process_hist);
        let msg = serde_json::to_string(&msg).unwrap();
        match websocket.send(msg.into()){
            Ok(_) => (),
            Err(_) => break
        }
        std::thread::sleep(Duration::from_millis(500));
    }
    _ = websocket.close(None);
}