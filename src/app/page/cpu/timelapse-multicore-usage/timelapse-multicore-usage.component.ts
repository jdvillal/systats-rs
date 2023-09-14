import { Component, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TimelapseSingleUsageComponent } from './timelapse-single-usage/timelapse-single-usage.component';
import { CommonModule } from '@angular/common';
import { CpuDataUpdateServiceService } from './service/cpu-data-update-service.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-timelapse-multicore-usage',
  templateUrl: './timelapse-multicore-usage.component.html',
  styleUrls: ['./timelapse-multicore-usage.component.css'],
  standalone: true,
  imports: [TimelapseSingleUsageComponent, CommonModule, NgChartsModule]
})
export class TimelapseMulticoreUsageComponent {
  private eventsSubscription!: Subscription;
  @Input() core_count_ready_event!: Observable<number>;

  public socket!: WebSocket;

  public cores_data:number[][] = [];

  constructor(
    private signalService: CpuDataUpdateServiceService
  ){}

  ngOnInit(){
    this.eventsSubscription = this.core_count_ready_event.subscribe((core_count) => {
      this.onCoreCountReady(core_count);
    });
  }

  ngOnDestroy() {
    if (this.socket) {
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
      this.socket.send("cpu_timelapse_multicore_usage");
    }
    this.socket.onmessage = (event) => {
      let data: number[][] = JSON.parse(event.data) as number[][];
      //TODO: instead of sending 120 arrays of 'core_count' len each, try and test 
      //sending 'core_count' arrays of 120 numbers to avoid doing the following data
      //manipulation in js  
      let lectures_count = data.length;
      
      for(let i = 0; i < core_count; i++){
        this.cores_data[i].length = 0;
        for(let j = 0; j < lectures_count; j++){
          this.cores_data[i].push(data[j][i]);
        }
      }
      
      this.signalService.sendMessage();
    }
  }

}
