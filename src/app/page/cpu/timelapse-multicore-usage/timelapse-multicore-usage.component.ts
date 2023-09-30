import { Component, Input, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TimelapseSingleUsageComponent } from './timelapse-single-usage/timelapse-single-usage.component';
import { CommonModule } from '@angular/common';
import { CpuDataUpdateNotifierService } from './service/cpu-data-update-notifier.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AppearanceSettingComponent } from './appearance-setting/appearance-setting.component';
import { CpuPreferences } from 'src/app/types/cpu-types';
import { CpuPreferencesService } from 'src/app/services/cpu-preferences.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-timelapse-multicore-usage',
  templateUrl: './timelapse-multicore-usage.component.html',
  styleUrls: ['./timelapse-multicore-usage.component.css'],
  standalone: true,
  imports: [TimelapseSingleUsageComponent, CommonModule, NgChartsModule, AppearanceSettingComponent]
})
export class TimelapseMulticoreUsageComponent {
  private eventsSubscription!: Subscription;
  @Input() core_count_ready_event!: Observable<number>;
  @Input() core_count!: number;

  public socket!: WebSocket;
  public cores_data:number[][] = [];

  x_scale = 1.5;
  y_scale = 0.75;
  line_color = "#bd1934";

  constructor(
    private core_data_update_notifier: CpuDataUpdateNotifierService,
    private prefrencesService: CpuPreferencesService
  ){
    let pref = this.prefrencesService.get_cpu_preferences();
    this.x_scale = pref.timelapse.x_scale;
    this.y_scale = pref.timelapse.y_scale;
    this.line_color = pref.timelapse.line_color;
  }

  ngOnInit(){
    if(this.core_count){
      this.onCoreCountReady(this.core_count)
      return;
    }
    this.eventsSubscription = this.core_count_ready_event.subscribe((core_count) => {
      this.onCoreCountReady(core_count);
    });
  }
  ngAfterViewInit(){
  }

  ngOnDestroy() {
    if(this.eventsSubscription){
      this.eventsSubscription.unsubscribe();
    }
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  private onCoreCountReady(core_count: number){
    //this.cores_data = [];
    for(let i = 0; i < core_count; i++){
      this.cores_data.push([])
    }
    this.socket = new WebSocket("ws://127.0.0.1:9001");
    this.socket.onopen = () => {
      this.socket.send(AppComponent.app_session_id);
      this.socket.send("cpu_timelapse_multicore_usage");
    }
    this.socket.onmessage = (event) => {
      let data: number[][] = JSON.parse(event.data) as number[][];
      //TODO: instead of sending 120 arrays (from rust-tauri) of 'core_count' len each, try and test 
      //sending 'core_count' arrays of 120 numbers to avoid doing the following data
      //manipulation in js  
      let lectures_count = data.length;
      
      for(let i = 0; i < core_count; i++){
        this.cores_data[i].length = 0;
        for(let j = 0; j < lectures_count; j++){
          this.cores_data[i].push(data[j][i]);
        }
      }
      this.core_data_update_notifier.notifyAll();
    }
  }

}
