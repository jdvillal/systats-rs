import { Injectable } from '@angular/core';
import { CpuPreferences } from '../types/cpu-types';

@Injectable({
  providedIn: 'root'
})
export class CpuPreferencesService {
  public static preferences: CpuPreferences;
  constructor() { }

  public set_default_preferences(): CpuPreferences{
    let pref: CpuPreferences = {
      version: 0.01,
      general: {
        default_chart: 'current'
      },
      current: {
        bars_color: '#2ae24c',
        background: '#b66ffd15'
      },
      timelapse: {
        x_scale: 1,
        y_scale: 0.65,
        line_color: '#bd1934',
        background: '#b66ffd15'
      }
    };
    localStorage.setItem('cpu-pref', JSON.stringify(pref));
    CpuPreferencesService.preferences = pref;
    return CpuPreferencesService.preferences;
  }

  public get_cpu_preferences(): CpuPreferences{
    if(CpuPreferencesService.preferences != undefined){
      return CpuPreferencesService.preferences
    }
    let pref_str = localStorage.getItem('cpu-pref');
    if(pref_str != undefined){
      let pref = JSON.parse(pref_str) as CpuPreferences;
      CpuPreferencesService.preferences = pref;
      return CpuPreferencesService.preferences;
    }
    return this.set_default_preferences();
  }

  public save(){
    localStorage.setItem('cpu-pref', JSON.stringify(CpuPreferencesService.preferences));
  };

}
