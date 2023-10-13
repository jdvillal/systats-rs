import { Injectable } from '@angular/core';
import { ProcessPreferences } from '../types/process';

@Injectable({
  providedIn: 'root'
})
export class ProcessPreferencesService {
  public static preferences: ProcessPreferences;
  constructor() { }

  public set_default_preferences(): ProcessPreferences{
    let pref: ProcessPreferences = {
      version: 0.01,
      cpu_usage_chart:{
          process_lines_color: '#bd1934',
          total_lines_color: '#ffffff',
          background_color: '#b66ffd15',
          show_total: false
      },
      memory_usage_chart:{
          process_lines_color: '#bd1934',
          total_lines_color: '#ffffff',
          background_color: '#b66ffd15',
          show_total: false
      },
      disk_usage_chart:{
          read_line_chart_color: '#bd1934',
          write_line_chart_color: '#be1900',
          background_color: '#b66ffd15'
      }
    };
    localStorage.setItem('process-pref', JSON.stringify(pref));
    ProcessPreferencesService.preferences = pref;
    return ProcessPreferencesService.preferences;
  }

  public get_preferences(): ProcessPreferences{
    if(ProcessPreferencesService.preferences != undefined){
      return ProcessPreferencesService.preferences
    }
    let pref_str = localStorage.getItem('process-pref');
    if(pref_str != undefined){
      let pref = JSON.parse(pref_str) as ProcessPreferences;
      ProcessPreferencesService.preferences = pref;
      return ProcessPreferencesService.preferences;
    }
    return this.set_default_preferences();
  }

  public save(){
    localStorage.setItem('process-pref', JSON.stringify(ProcessPreferencesService.preferences));
  }
}
