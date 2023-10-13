import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageRoutingModule } from './page-routing.module';
import { CurrentMulticoreUsageComponent } from './cpu/current-multicore-usage/current-multicore-usage.component';
import { NgChartsModule } from 'ng2-charts';
import { ProcessDiskUsageComponent } from './process/process-disk-usage/process-disk-usage.component';

@NgModule({
    declarations: [
  
    ProcessDiskUsageComponent
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
