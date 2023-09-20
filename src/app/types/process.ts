export interface ProcessInformation{
    pid: number,
    parent_pid: number | null,
    name: string,
    executable_path: string,
    status: string,
    cpu_usage: number,
    memory_usage: number,
    virtual_memory_usage: number,
    children_processes: ProcessInformation[],
    timelapse_cpu_usage: number[],
    timelapse_memory_usage: number[]
}