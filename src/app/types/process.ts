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

export type ProcessesOrderBy =  'process_name' | 'pid' | 'parent_pid' | 'cpu_usage' | 'memory_usage';

export interface ProcessHistory{
    cpu_usage: number[],
    mem_usage: number[],
    disk_read_usage: number[],
    disk_write_usage: number[],
}