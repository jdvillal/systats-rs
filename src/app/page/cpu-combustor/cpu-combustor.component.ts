import { Component, Input, signal } from '@angular/core';
import { CoreCombustorComponent } from './core-combustor/core-combustor.component';
import { CommonModule } from '@angular/common';
import { invoke } from '@tauri-apps/api';
import { CpuInfo } from 'src/app/types/cpu-types';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cpu-combustor',
  templateUrl: './cpu-combustor.component.html',
  styleUrls: ['./cpu-combustor.component.css'],
  standalone: true,
  imports: [CoreCombustorComponent, CommonModule]
})
export class CpuCombustorComponent {
  info_ready_subject: Subject<number> = new Subject<number>();
  public core_count!: number;
  //public port = signal(0);


  ngOnInit(){
    //TODO: invoke tauri command
    invoke<CpuInfo>("get_cpu_information", {}).then((res) => {
      this.core_count = res.logical_core_count + 1;
    });
  }

  public stop_combustor(){
    
  }

}
