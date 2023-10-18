use cpu::CpuTracker;
use memory::MemTracker;

pub mod cpu;
pub mod memory;


/// Represents the amount of time (in minutes) that a tracker will record.
///
/// Internally this is used to calculate the size of the buffer
/// where the resource information is beign saved.   
#[derive(Clone, Copy)]
pub enum TrackerCapacity{
    /// One minute
    ONE,
    /// Five minutes
    FIVE,
    /// Ten minutes
    TEN,
    /// Custom (up to 255 minutes)
    CUSTOM(u8)
}

impl TrackerCapacity{
    fn to_buffer_size(self) -> usize{
        match self{
            TrackerCapacity::ONE => 120,
            TrackerCapacity::FIVE => 120 * 5,
            TrackerCapacity::TEN => 120 * 10,
            TrackerCapacity::CUSTOM(m) => 120 * m as usize
        }
    }
}

pub struct SystemTracker;

impl SystemTracker{
    /// Create a tracker that records each system's CPU-core usage over 1 minute.
    /// ```
    /// let mut cpu_tracker = SystemTracker::new_cpu_tracker();
    /// ```
    pub fn new_cpu_tracker() -> CpuTracker{
        CpuTracker::default()
    }

    /// Create a tracker that records each system's CPU-core usage over a specified lapse.
    /// ```
    /// let mut cpu_tracker = SystemTracker::new_cpu_tracker_with_capacity(TrackerCapacity::FIVE);
    /// let mut cpu_tracker = SystemTracker::new_cpu_tracker_with_capacity(TrackerCapacity::CUSTOM(20));
    /// ```
    pub fn new_cpu_tracker_with_capacity(minutes: TrackerCapacity) -> CpuTracker{
        CpuTracker::with_capacity(minutes)
    }

    /// Create a tracket that record memory usage over 1 minute.
    /// ```
    /// let mut cpu_tracker = SystemTracker::new_mem_tracker();
    /// ```
    pub fn new_mem_tracker() -> MemTracker{
        MemTracker::default()
    }
    /// Create a tracket that record memory usage over a custom lapse.
    /// ```
    /// let mut mem_tracker = SystemTracker::new_mem_tracker_with_capacity(TrackerCapacity::FIVE);
    /// let mut mem_tracker = SystemTracker::new_mem_tracker_with_capacity(TrackerCapacity::CUSTOM(20));
    /// ```
    pub fn new_mem_tracker_with_capacity(minutes: TrackerCapacity) -> MemTracker{
        MemTracker::with_capacity(minutes)
    }
}