import { Component} from '@angular/core';
import { invoke } from "@tauri-apps/api/tauri";
import { CurrentMulticoreUsageComponent } from './current-multicore-usage/current-multicore-usage.component';
import { TimelapseMulticoreUsageComponent } from './timelapse-multicore-usage/timelapse-multicore-usage.component';
import { CpuInfo } from 'src/app/types/cpu-types';
import { Subject } from 'rxjs';
import { TimelapseSingleUsageComponent } from './timelapse-multicore-usage/timelapse-single-usage/timelapse-single-usage.component';
import { CommonModule } from '@angular/common';
import { CurrentSinglecoreUsageComponent } from './current-singlecore-usage/current-singlecore-usage.component';

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
    CurrentSinglecoreUsageComponent
  ]
})
export class CpuComponent {
  core_count_ready_subject: Subject<number> = new Subject<number>();
  core_count!: number;
  socket!: WebSocket;
  cpu_info: CpuInfo = { vendor_id: '', brand: '', max_frequency: 0, physical_core_count: 0, logical_core_count: 0 };


  current_chart_type: 'timelapse'|'current' = 'timelapse';
  ngOnInit() {
    this.get_cpu_information();
  }

  get_cpu_information(): void {
    invoke<CpuInfo>("get_cpu_information", {}).then((res) => {
      this.cpu_info = res;
      this.core_count = this.cpu_info.logical_core_count;
      this.core_count_ready_subject.next(this.cpu_info.logical_core_count);
    });
  }

  public set_current_chart_type(chart_type: 'current' | 'timelapse'){
    this.current_chart_type = chart_type;
  }

}
