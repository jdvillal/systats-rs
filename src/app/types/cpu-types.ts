export interface CpuInfo{
    vendor_id: string,
    brand: string,
    max_frequency: number,
    physical_core_count: number,
    logical_core_count: number,
}

export interface CpuPreferences{
    version: number,
    general: {
        default_chart: 'current' | 'timelapse',
    },
    current: {
        bar_color: string,
        background: string
    },
    timelapse: {
        x_scale: number,
        y_scale: number,
        line_color: string,
        background: string
    }

}