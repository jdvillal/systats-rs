import { Component, Input} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TimelapseSingleUsageComponent } from './timelapse-single-usage/timelapse-single-usage.component';
import { CommonModule } from '@angular/common';
import { CpuDataUpdateNotifierService } from './service/cpu-data-update-notifier.service';
import { NgChartsModule } from 'ng2-charts';
import { AppearanceSettingComponent } from './appearance-setting/appearance-setting.component';
import { CoreBuffer} from 'src/app/types/cpu-types';
import { CpuPreferencesService } from 'src/app/services/cpu-preferences.service';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

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

  unlisten_update_event: any;//function to 'unsubscribe' from update event

  ngOnInit(){
    if(this.core_count){
      for(let i = 0; i < this.core_count; i++){
        this.cores_data.push([])
      }
      invoke<any>("emit_cpu_mulitcore_historical_usage", { }).then(async ()=>{
        this.unlisten_update_event = await listen('cpu_multicore_historical_usage', (event) => {
          this.update_chart(event.payload as CoreBuffer[]);
        })
      })
    }
  }
  ngAfterViewInit(){
  }

  ngOnDestroy() {
    this.unlisten_update_event();
    invoke<any>("stop_cpu_mulitcore_historical_usage", { });
  }

  private update_chart(data: CoreBuffer[]){
    for(let i = 0; i < this.core_count; i++){
      this.cores_data[i].length = 0;
      for(let n of data[i].buffer){
        this.cores_data[i].push(n)
      }
    }
    this.core_data_update_notifier.notifyAll();
  }

}
