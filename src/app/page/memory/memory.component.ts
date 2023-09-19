import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { Subject } from 'rxjs';
import { MemoryInfo } from 'src/app/types/memory-types';
import { TimelapseMemoryUsageComponent } from './timelapse-memory-usage/timelapse-memory-usage.component';
import { CurrentMemoryUsageComponent } from './current-memory-usage/current-memory-usage.component';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.css'],
  standalone: true,
  imports: [CommonModule, TimelapseMemoryUsageComponent, CurrentMemoryUsageComponent]
})
export class MemoryComponent {
  public memory_info_ready_subject: Subject<number> = new Subject<number>();
  public memInfo!: MemoryInfo;
  public total_memory!: number;

  public current_chart_type: 'current' | 'timelapse' = 'timelapse';

  ngOnInit(){
    this.get_memory_information();
  }

  get_memory_information(): void {
    invoke<MemoryInfo>("get_memory_information", {}).then((res) => {
      this.memInfo = res as MemoryInfo;
      this.total_memory = this.memInfo.total;
      this.memory_info_ready_subject.next(this.memInfo.total);
      
    });
  }

  set_current_chart_type(chart_type: 'current' | 'timelapse'){
    this.current_chart_type = chart_type;
  }

}
