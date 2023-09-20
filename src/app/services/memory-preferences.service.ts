import { Injectable } from '@angular/core';
import { MemoryPreferences } from '../types/memory-types';

@Injectable({
  providedIn: 'root'
})
export class MemoryPreferencesService {
  public static preferences: MemoryPreferences;
  constructor() { }

  public set_default_preferences(): MemoryPreferences{
    let pref: MemoryPreferences = {
      version: 0.01,
      general: {},
      timelapse : {
        line_color: '#2ae24c',
        background_color: '#b66ffd15'
      }
    };
    localStorage.setItem('memory-pref', JSON.stringify(pref));
    MemoryPreferencesService.preferences = pref;
    return MemoryPreferencesService.preferences;
  }

  public get_memory_preferences(): MemoryPreferences{
    if(MemoryPreferencesService.preferences != undefined){
      return MemoryPreferencesService.preferences
    }
    let pref_str = localStorage.getItem('memory-pref');
    if(pref_str != undefined){
      let pref = JSON.parse(pref_str) as MemoryPreferences;
      MemoryPreferencesService.preferences = pref;
      return MemoryPreferencesService.preferences;
    }
    return this.set_default_preferences();
  }

  public save(){
    localStorage.setItem('memory-pref', JSON.stringify(MemoryPreferencesService.preferences));
  };
}
