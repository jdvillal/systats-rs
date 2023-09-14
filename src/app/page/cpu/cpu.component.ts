import { Component, EventEmitter, Output } from '@angular/core';
import { invoke } from "@tauri-apps/api/tauri";
import { CurrentMulticoreUsageComponent } from './current-multicore-usage/current-multicore-usage.component';
import { TimelapseMulticoreUsageComponent } from './timelapse-multicore-usage/timelapse-multicore-usage.component';
import { CpuInfo } from 'src/app/types/cpu-types';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cpu',
  templateUrl: './cpu.component.html',
  styleUrls: ['./cpu.component.css'],
  standalone: true,
  imports: [CurrentMulticoreUsageComponent]
})
export class CpuComponent {
  eventsSubject: Subject<number> = new Subject<number>();
  socket!: WebSocket;
  cpu_info: CpuInfo = { vendor_id: '', brand: '', max_frequency: 0, physical_core_count: 0, logical_core_count: 0 };
  ngOnInit() {
    this.get_cpu_information();
  }

  get_cpu_information(): void {
    //event.preventDefault();
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<CpuInfo>("get_cpu_information", {}).then((res) => {
      console.log(res)
      this.cpu_info = res;
      this.eventsSubject.next(this.cpu_info.logical_core_count);
    });
  }

}
