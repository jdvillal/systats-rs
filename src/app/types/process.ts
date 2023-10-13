export interface ProcessInformation{
    pid: number,
    parent_pid: number | null,
    parent_name: string | null,
    name: string,
    executable_path: string,
    status: string,
    cpu_usage: number,
    memory_usage: number,
    virtual_memory_usage: number,
    children_processes: ChildProcessInformation[],
}

export interface ChildProcessInformation{
    pid: number,
    name: string
}

export type ProcessesOrderBy =  'process_name' | 'pid' | 'parent_pid' | 'cpu_usage' | 'memory_usage';

export interface ProcessHistory{
    pid: number,
    parent_pid: number | null,
    name: string,
    cpu_usage: number[],
    mem_usage: number[],
    disk_read_usage: number[],
    disk_write_usage: number[],
}

export interface ProcessPreferences{
    version: number,
    cpu_usage_chart:{
        process_lines_color: string,
        total_lines_color: string,
        background_color: string,
        show_total: boolean
    },
    memory_usage_chart:{
        process_lines_color: string,
        total_lines_color: string,
        background_color: string,
        show_total: boolean
    },
    disk_usage_chart:{
        read_line_chart_color: string,
        write_line_chart_color: string
        background_color: string,
    }
}