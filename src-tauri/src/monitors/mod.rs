use std::{sync::{Arc, Mutex}, net::TcpListener, thread};
use tungstenite::accept;
use crate::streamers;

use self::{cpu::start_cpu_monitor, memory::start_memory_monitor};

pub mod cpu;
pub mod memory;

enum MonitoringRequestType{
    CpuCurrentSingleCoreUsage,
    CpuCurrentMultiCoreUsage,
    CpuTimelapseSingleCoreUsage,
    CpuTimelapseMultiCoreUsage,
    MemoryTimelapseUsage,
    MemorySwapCurrentUsage,
    CurrentRunningProcesses,
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
        }
        return Self::Unknown;
    }
}

pub fn initialize_monitors(){
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
            thread::spawn(move||{
                let mut websocket = accept(stream.unwrap()).unwrap();
                let msg = websocket.read().unwrap().to_string();
                let msg = msg.as_str();
                println!("websocket message ==> {}", msg);
                let resquest_type = MonitoringRequestType::from_msg(msg);
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
                        streamers::process::handle_current_processes_websocket(websocket)
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