export interface CpuInfo{
    vendor_id: string,
    name: string,
    brand: string,
    physical_core_count: number,
    logical_core_count: number,
}

export type CpuChartType = 'current' | 'timelapse'

export interface SystemStateInfo{
    frequency: number,
    running_processes: number,
    avg_load_one: number,
    avg_load_five: number,
    avg_load_fifteen: number,
    uptime: number,
    boot_time: number,
    distribution_id: string,
    os_version: string | null
}

export interface CpuPreferences{
    version: number,
    general: {
        default_chart: CpuChartType
    },
    current: {
        bars_color: string,
        background: string
    },
    timelapse: {
        x_scale: number,
        y_scale: number,
        line_color: string,
        background: string
    }

}