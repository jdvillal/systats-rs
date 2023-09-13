import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageRoutingModule } from './page-routing.module';
import { CpuComponent } from './cpu/cpu.component';
import { MemoryComponent } from './memory/memory.component';
import { DiskComponent } from './disk/disk.component';
import { ProcessesComponent } from './processes/processes.component';



@NgModule({
  declarations: [
    CpuComponent,
    MemoryComponent,
    DiskComponent,
    ProcessesComponent
  ],
  imports: [
    CommonModule,
    PageRoutingModule
  ],
  exports: [RouterModule]
})
export class PageModule { }
