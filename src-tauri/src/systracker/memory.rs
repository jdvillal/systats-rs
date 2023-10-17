use std::{sync::{Mutex, Arc, atomic::AtomicBool}, time::{Duration, Instant}, thread, ops::{DerefMut, Deref}};

use serde::Serialize;
use sysinfo::{System, SystemExt};

use super::TrackerCapacity;


/// Wraps a buffer that contains historial memory usage recorded by a MemTracker
/// over the lapse specified when `new_mem_tracker()` or `new_mem_tracker_with_capacity()`
/// was called.
#[derive(Debug, Clone, Serialize)]
pub struct MemBuffer{
    buffer: Vec<u64>
}

impl MemBuffer{
    fn new(capacity: usize) -> Self{
        let mut mb = MemBuffer { buffer: Vec::with_capacity(capacity) };
        for _ in 0..capacity{
            mb.buffer.push(0)
        }
        mb
    }
}

/// A struct that represents a memory usage tracker.
/// When created, it spawns a background thread that records the system's used memory (in bytes).
/// The information is updated twice per second.
/// 
/// To get the recorded data up to 'now', call `fetch_usage()`
/// and to stop recording CPU usage, call `stop()`.
/// 
/// Once stoped, the `fetch_usage()` method will always return `None` 
pub struct MemTracker{
    buffer: Arc<Mutex<MemBuffer>>,
    stop_flag: Arc<AtomicBool>,
    capacity: TrackerCapacity
}

impl MemTracker{
    pub (crate) fn default() -> MemTracker{
        MemTracker::with_capacity(TrackerCapacity::ONE) 
    }
    //
    //Create a tracker that records memory usage for the specified lapse
    //
    pub (crate) fn with_capacity(minutes: TrackerCapacity) -> MemTracker{
        let capacity: usize = minutes.to_buffer_size();
        let sys = System::new_all();

        let buff: MemBuffer = MemBuffer::new(capacity);

        let tracker = MemTracker{
            buffer: Arc::new(Mutex::new(buff)),
            stop_flag: Arc::new(AtomicBool::new(false)),
            capacity: minutes
        };
        let tracker_buffer = Arc::clone(&tracker.buffer);
        let stop_flag = Arc::clone(&tracker.stop_flag);
        refresh_loop(sys, tracker.capacity, tracker_buffer, stop_flag);
        tracker
    }
    /// Stop the background thread that updates the buffer where
    /// historical memory usage information is saved.
    /// 
    /// Consider that calling this method will make later calls to `fetch_usage()`
    /// always return `None`.
    pub fn stop(&mut self){
        self.stop_flag.store(true, std::sync::atomic::Ordering::Relaxed);
    }
    /// Fetch the the historical memory usage information recorded from 'capacity' ago
    /// up until 'now'. Consider that if the `MemTracker` was crated recently,
    /// depending of the tracker capacity, the first positions of the buffer will be
    /// filled with 0s for quite some time.
    /// 
    /// Also, consider that calling `stop()` will make later calls to this method
    /// always return `None`.
    pub fn fetch_usage(&mut self) -> Option<MemBuffer>{
        if self.stop_flag.load(std::sync::atomic::Ordering::Relaxed) {
            return None;
        }
        let resp: MemBuffer = {    
            let try_buffers = self.buffer.lock();
            let buffers = match try_buffers {
                Err(_) => return None,
                Ok(b) => b,
            };
            let r = buffers.deref().clone();
            r
        };
        Some(resp)
    }
}


fn refresh_loop(mut sys: System, capacity: TrackerCapacity, buffer: Arc<Mutex<MemBuffer>>, stop_flag: Arc<AtomicBool>){
    thread::spawn(move ||{
        loop{
            let now = Instant::now();
            sys.refresh_memory();
            let buffer_size: usize = capacity.to_buffer_size();
            {
                let try_buffer = buffer.lock();
                let mut buffer = match try_buffer {
                    Err(_) => continue,
                    Ok(b) => b,
                };
                let mem_buffer = &mut buffer.deref_mut().buffer;
                mem_buffer.rotate_left(1);
                mem_buffer[buffer_size - 1] = sys.used_memory();
            }
            let elapsed = now.elapsed().as_millis();
            if elapsed >= 500 {
                continue;
            }
            if stop_flag.load(std::sync::atomic::Ordering::Relaxed) {
                break;
            }
            thread::sleep(Duration::from_millis(500))
        }
    });
    
}