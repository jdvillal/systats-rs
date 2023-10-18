import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { Subject } from 'rxjs';
import { MemoryInfo } from 'src/app/types/memory-types';
import { TimelapseMemoryUsageComponent } from './timelapse-memory-usage/timelapse-memory-usage.component';
import { CurrentMemoryUsageComponent } from './current-memory-usage/current-memory-usage.component';
import { CurrentSwapUsageComponent } from './current-swap-usage/current-swap-usage.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TimelapseMemoryUsageComponent,
    CurrentMemoryUsageComponent,
    CurrentSwapUsageComponent,
    TranslateModule
  ]
})
export class MemoryComponent {

  public memInfo!: MemoryInfo;

  ngOnInit(){
    this.get_memory_information();
  }

  get_memory_information(): void {
    invoke<MemoryInfo>("get_memory_information", {}).then((res) => {
      this.memInfo = res as MemoryInfo;
    });
  }

}
