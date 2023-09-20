export interface MemoryInfo{
    total: number,
    total_swap: number
}

export interface MemoryPreferences{
    version: number,
    general: {},
    timelapse: {
        line_color: string,
        background_color: string
    }
    }
    