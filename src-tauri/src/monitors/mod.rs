use std::{sync::{Arc, Mutex}, net::{TcpListener, TcpStream}, thread};
use tungstenite::{accept, WebSocket};
use uuid::Uuid;
use crate::streamers;

use self::{cpu::start_cpu_monitor, memory::start_memory_monitor};

pub mod cpu;
pub mod memory;
pub mod process;

enum MonitoringRequestType{
    CpuCurrentSingleCoreUsage,
    CpuCurrentMultiCoreUsage,
    CpuTimelapseSingleCoreUsage,
    CpuTimelapseMultiCoreUsage,
    MemoryTimelapseUsage,
    MemorySwapCurrentUsage,
    CurrentRunningProcesses,
    SystemStateInformation,
    Unknown
}

impl MonitoringRequestType{
    fn from_msg(msg: &str) -> Self{
        if msg == "cpu_current_singlecore_usage" {
            return Self::CpuCurrentSingleCoreUsage;
        }else if msg == "cpu_current_multicore_usage" {
            return Self::CpuCurrentMultiCoreUsage;
        }else if msg == "cpu_timelapse_singlecore_usage"{
            return Self::CpuTimelapseSingleCoreUsage;
        }else if msg == "cpu_timelapse_multicore_usage"{
            return Self::CpuTimelapseMultiCoreUsage;
        }else if msg == "memory_timelapse_usage"{
            return Self::MemoryTimelapseUsage;
        }else if msg == "memory_swap_current_usage"{
            return Self::MemorySwapCurrentUsage
        }else if msg == "current_running_processes"{
            return Self::CurrentRunningProcesses
        }else if msg == "system_state_information"{
            return Self::SystemStateInformation
        }
        return Self::Unknown;
    }
}

fn check_app_session_id(session_id: &str, mut websocket: WebSocket<TcpStream>) -> Result<WebSocket<TcpStream>,()>{
//Check app_session_id
    let received_session_id = websocket.read().unwrap().to_string();
    if received_session_id.len() != session_id.len() {
        _ = websocket.close(None);
        return Err(());
    }
    if received_session_id != session_id {
        _ = websocket.close(None);
        return Err(());
    }
    Ok(websocket)
}

pub fn initialize_monitors(app_session_id: Arc<Uuid>){
    //vec of cpu usage, each inner vec contains the usage of each cpu core at a given time
    let cpu_timelapse_data: Vec<Vec<f32>> = Vec::new();
    let cpu_timelapse_data_arc = Arc::new(Mutex::new(cpu_timelapse_data));

    //vec of memory usage
    let memory_timelapse_data: Vec<u64> = Vec::new();
    let memory_timelapse_data_arc = Arc::new(Mutex::new(memory_timelapse_data));

    start_cpu_monitor(Arc::clone(&cpu_timelapse_data_arc));
    start_memory_monitor(Arc::clone(&memory_timelapse_data_arc));

    let server = TcpListener::bind("127.0.0.1:9001").unwrap();
    thread::spawn(move ||{
        for stream in server.incoming(){
            let cpu_timelapse_data_arc = Arc::clone(&cpu_timelapse_data_arc);
            let memory_timelapse_data_arc = Arc::clone(&memory_timelapse_data_arc);
            let app_session_id = Arc::clone(&app_session_id);
            thread::spawn(move||{
                let mut websocket = accept(stream.unwrap()).unwrap();
                
                websocket = match check_app_session_id(&app_session_id.to_string(), websocket){
                    Ok(s) => s,
                    Err(_) => return,
                };

                let msg = websocket.read().unwrap().to_string();
                let msg = msg.as_str();
                println!("websocket message ==> {}", msg);
                let resquest_type = MonitoringRequestType::from_msg(&msg);
                use MonitoringRequestType as MRT;
                match resquest_type{
                    MRT::CpuCurrentSingleCoreUsage => {
                        streamers::cpu::handle_current_singlecore_utilization_websocket(websocket);
                    },
                    MRT::CpuCurrentMultiCoreUsage => {
                        streamers::cpu::handle_current_multicore_utilization_websocket(websocket);
                    },
                    MRT::CpuTimelapseSingleCoreUsage => {
                        streamers::cpu::handle_timelapse_singlecore_utilization_websocket(cpu_timelapse_data_arc, websocket);
                    },
                    MRT::CpuTimelapseMultiCoreUsage => {
                        streamers::cpu::handle_timelapse_multicore_utilization_websocket(cpu_timelapse_data_arc, websocket);
                    },
                    MRT::MemoryTimelapseUsage => {
                        streamers::memory::handle_timelapse_memory_utilization_websocket(memory_timelapse_data_arc, websocket);
                    },
                    MRT::MemorySwapCurrentUsage => {
                        streamers::memory::handle_current_mememory_swap_usage_websocket(websocket);
                    },
                    MRT::CurrentRunningProcesses =>{
                        streamers::process::handle_current_processes_websocket(websocket);
                    },
                    MRT::SystemStateInformation =>{
                        streamers::cpu::handle_current_system_state_websocket(websocket);
                    },
                    MRT::Unknown => {
                        println!("Unkown request, closing socket!");
                        _ = websocket.close(None);
                    },
                }
            });

        }
    });
}