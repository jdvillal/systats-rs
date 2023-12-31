import { Component, Input, NgZone } from '@angular/core';
import { invoke } from "@tauri-apps/api/tauri";
import { CurrentMulticoreUsageComponent } from './current-multicore-usage/current-multicore-usage.component';
import { TimelapseMulticoreUsageComponent } from './timelapse-multicore-usage/timelapse-multicore-usage.component';
import { CpuChartType, CpuInfo, SystemStateInfo } from 'src/app/types/cpu-types';
import { Subject } from 'rxjs';
import { TimelapseSingleUsageComponent } from './timelapse-multicore-usage/timelapse-single-usage/timelapse-single-usage.component';
import { CommonModule } from '@angular/common';
import { CurrentSinglecoreUsageComponent } from './current-singlecore-usage/current-singlecore-usage.component';
import { PagesStateService } from 'src/app/services/pages-state.service';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { listen } from '@tauri-apps/api/event';

@Component({
  selector: 'app-cpu',
  templateUrl: './cpu.component.html',
  styleUrls: ['./cpu.component.css'],
  standalone: true,
  imports: [
    CurrentMulticoreUsageComponent,
    TimelapseMulticoreUsageComponent,
    TimelapseSingleUsageComponent,
    CommonModule,
    CurrentSinglecoreUsageComponent,
    TranslateModule
  ]
})
export class CpuComponent {
  core_count_ready_subject: Subject<number> = new Subject<number>();
  core_count!: number;
  cpu_info: CpuInfo = { vendor_id: '', name: '', brand: '', physical_core_count: 0, logical_core_count: 0 };
  sys_state_info: SystemStateInfo = {
    frequency: 0, running_processes: 0, avg_load_one: 0, avg_load_five: 0, avg_load_fifteen: 0, uptime: 0, boot_time: 0,
    distribution_id: '',
    os_version: null
  };

  current_chart_type: CpuChartType = 'timelapse';

  socket!: WebSocket;

  constructor(
    private ngZone: NgZone,
    private pagesStateService: PagesStateService
  ) { }

  unlisten_update_event: any;//function to 'unsubscribe' from update event

  ngOnInit() {
    let current_chart_type = this.pagesStateService.get_page_state().current_cpu_chart_type;
    if (current_chart_type) {
      this.current_chart_type = current_chart_type;
    }
    this.get_cpu_information();

    invoke<any>('emit_system_information').then(async ()=>{
      this.unlisten_update_event = await listen('system_information', (event) => {
        this.ngZone.run(() => {
          this.sys_state_info = JSON.parse(event.payload as string) as SystemStateInfo;
        })
        
      })
    })
  }

  ngOnDestroy(){
    this.unlisten_update_event();
    invoke<any>('stop_system_information');
  }

  get_cpu_information() {
    invoke<CpuInfo>("get_cpu_information").then((res: CpuInfo) => {
      this.cpu_info = res;
      this.core_count = this.cpu_info.logical_core_count;
      this.core_count_ready_subject.next(this.cpu_info.logical_core_count);
    });
  }

  public set_current_chart_type(chart_type: CpuChartType) {
    this.current_chart_type = chart_type;
    this.pagesStateService.get_page_state().current_cpu_chart_type = chart_type;
  }

  format_uptime(seconds: number) {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
  }

  format_boot_time(timestamp: number): string{
    let date = new Date(timestamp * 1000);
    return date.toLocaleDateString() +" " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
  }

}


