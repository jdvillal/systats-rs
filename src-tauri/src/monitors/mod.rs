use std::{sync::{Arc, Mutex}, net::TcpListener, thread};
use tungstenite::accept;
use crate::streamers;

use self::cpu::start_cpu_monitor;

pub mod cpu;

enum MonitoringRequestType{
    CpuCurrentSingleCoreUsage,
    CpuCurrentMultiCoreUsage,
    CpuTimelapseSingleCoreUsage,
    CpuTimelapseMultiCoreUsage,
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
        }
        return Self::Unknown;
    }
}

pub fn initialize_monitors(){
    //vec of cpu usage, each inner vec contains the usage of each cpu core at a given time
    let cpu_timelapse_data: Vec<Vec<f32>> = Vec::new();
    let cpu_timelapse_data_arc = Arc::new(Mutex::new(cpu_timelapse_data));

    start_cpu_monitor(Arc::clone(&cpu_timelapse_data_arc));

    let server = TcpListener::bind("127.0.0.1:9001").unwrap();
    thread::spawn(move ||{
        for stream in server.incoming(){
            let cpu_timelapse_data_arc = Arc::clone(&cpu_timelapse_data_arc);
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
                    MRT::Unknown => {
                        println!("Unkown request, closing socket!");
                        _ = websocket.close(None);
                    },
                }
            });

        }
    });
}