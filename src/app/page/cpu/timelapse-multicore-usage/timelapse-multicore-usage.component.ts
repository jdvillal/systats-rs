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
  @Input() core_count!: number;

  public socket!: WebSocket;

  public cores_data:number[][] = [];

  x_scale = 1.5;
  y_scale = 0.75;

  constructor(
    private signalService: CpuDataUpdateServiceService
  ){}

  ngOnInit(){
    if(this.core_count){
      this.onCoreCountReady(this.core_count)
      return;
    }
    this.eventsSubscription = this.core_count_ready_event.subscribe((core_count) => {
      this.onCoreCountReady(core_count);
    });
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
      
      this.signalService.sendMessage();
    }
  }


  
  public test_data = [0,1.9607844,2,0,0,2,3.9215689,18,18,0,0,6.122449,8,0,2,4.166667,1.9607844,2,0,0,0,2,0,0,4,4,0,5.769231,4.0816326,4,2,2,4,5.769231,4,4,5.769231,0,5.882353,5.882353,7.692308,4,0,7.692308,10,3.9215689,0,2,2,3.846154,0,3.9215689,0,2,8,4.0816326,4,4,11.764706,4.0816326,3.9215689,2.0408163,3.9215689,0,0,1.9607844,3.9215689,4,8.163265,6,4,8,4.0816326,6,16.32653,14,2,4.0816326,4.0816326,24,0,30.769232,0,6.122449,2,14,4,6,4.0816326,0,34,0,20.833332,0,15.6862755,2.0408163,2,13.725491,2,4,6.122449,8,14,25.490198,18.367348,6.122449,12,4,8,14.285715,6,5.769231,7.8431377,10.204082,14,2,8.163265,8,10,10];
  
  test_x_scale = 1;
  public set_x_scale(new_x_scale: string){
    this.test_x_scale = Number.parseFloat(new_x_scale);
  }

  test_y_scale = 1;
  public set_y_scale(new_y_scale: string){
    this.test_y_scale = Number.parseFloat(new_y_scale);
  }

  public apply_changes(){
    this.x_scale = this.test_x_scale;
    this.y_scale = this.test_y_scale;
  }
}
