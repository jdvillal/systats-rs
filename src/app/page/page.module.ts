import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageRoutingModule } from './page-routing.module';
import { CpuComponent } from './cpu/cpu.component';
import { MemoryComponent } from './memory/memory.component';
import { DiskComponent } from './disk/disk.component';
import { ProcessesComponent } from './processes/processes.component';
import { CurrentMulticoreUsageComponent } from './cpu/current-multicore-usage/current-multicore-usage.component';
import { TimelapseMulticoreUsageComponent } from './cpu/timelapse-multicore-usage/timelapse-multicore-usage.component';
import { CurrentSinglecoreUsageComponent } from './cpu/current-singlecore-usage/current-singlecore-usage.component';
import { NgChartsModule } from 'ng2-charts';
import { TimelapseSingleUsageComponent } from './cpu/timelapse-multicore-usage/timelapse-single-usage/timelapse-single-usage.component';
import { AppearanceSettingsComponent } from './cpu/timelapse-muticore-usage/appearance-settings/appearance-settings.component';
import { AppearanceSettingComponent } from './cpu/timelapse-multicore-usage/appearance-setting/appearance-setting.component';



@NgModule({
    declarations: [
        MemoryComponent,
        DiskComponent,
        ProcessesComponent,
        AppearanceSettingsComponent,
        AppearanceSettingComponent,
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
