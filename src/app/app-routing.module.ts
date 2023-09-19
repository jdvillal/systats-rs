import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page/page.component';
import { CpuComponent } from './page/cpu/cpu.component';
import { MemoryComponent } from './page/memory/memory.component';
import { ProcessesComponent } from './page/processes/processes.component';
import { DisksComponent } from './page/disks/disks.component';

const routes: Routes = [
  {path: 'page', component: PageComponent, children:[
    {path: 'cpu', component: CpuComponent},
    {path: 'memory', component: MemoryComponent},
    {path: 'disk', component: DisksComponent},
    {path: 'processes', component: ProcessesComponent},
  ]},
  
  {path: '', redirectTo: 'page/cpu', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
