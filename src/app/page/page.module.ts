import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageRoutingModule } from './page-routing.module';
import { DiskComponent } from './disk/disk.component';
import { ProcessesComponent } from './processes/processes.component';
import { CurrentMulticoreUsageComponent } from './cpu/current-multicore-usage/current-multicore-usage.component';
import { NgChartsModule } from 'ng2-charts';
import { CurrentMemoryUsageComponent } from './memory/current-memory-usage/current-memory-usage.component';



@NgModule({
    declarations: [
        DiskComponent,
        ProcessesComponent,
    ],
    exports: [RouterModule],
    imports: [
        CommonModule,
        PageRoutingModule,
        CurrentMulticoreUsageComponent,
        NgChartsModule
    ]
})
export class PageModule { }
