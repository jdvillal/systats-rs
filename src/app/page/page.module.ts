import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageRoutingModule } from './page-routing.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PageRoutingModule
  ],
  exports: [RouterModule]
})
export class PageModule { }
