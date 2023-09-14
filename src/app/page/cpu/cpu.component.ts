import { Component} from '@angular/core';
import { invoke } from "@tauri-apps/api/tauri";
import { CurrentMulticoreUsageComponent } from './current-multicore-usage/current-multicore-usage.component';
import { TimelapseMulticoreUsageComponent } from './timelapse-multicore-usage/timelapse-multicore-usage.component';
import { CpuInfo } from 'src/app/types/cpu-types';
import { Subject } from 'rxjs';
import { TimelapseSingleUsageComponent } from './timelapse-multicore-usage/timelapse-single-usage/timelapse-single-usage.component';

@Component({
  selector: 'app-cpu',
  templateUrl: './cpu.component.html',
  styleUrls: ['./cpu.component.css'],
  standalone: true,
  imports: [CurrentMulticoreUsageComponent, TimelapseMulticoreUsageComponent, TimelapseSingleUsageComponent]
})
export class CpuComponent {
  core_count_ready_subject: Subject<number> = new Subject<number>();
  socket!: WebSocket;
  cpu_info: CpuInfo = { vendor_id: '', brand: '', max_frequency: 0, physical_core_count: 0, logical_core_count: 0 };
  ngOnInit() {
    this.get_cpu_information();
  }

  get_cpu_information(): void {
    invoke<CpuInfo>("get_cpu_information", {}).then((res) => {
      this.cpu_info = res;
      this.core_count_ready_subject.next(this.cpu_info.logical_core_count);
    });
  }

}
