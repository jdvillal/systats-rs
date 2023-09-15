import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
import { CpuDataUpdateServiceService } from '../service/cpu-data-update-service.service';

@Component({
  selector: 'app-timelapse-single-usage',
  templateUrl: './timelapse-single-usage.component.html',
  styleUrls: ['./timelapse-single-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule]
})
export class TimelapseSingleUsageComponent {
  private eventsSubscription!: Subscription;

  @Input() core_number: number = 0;
  @Input() core_data: number[] = [];

  @ViewChild('core_chart') chart?: ElementRef<HTMLCanvasElement>;

  chart_context!: CanvasRenderingContext2D;

  constructor(
    private signalService: CpuDataUpdateServiceService
  ) { }

  ngOnInit() {

  }

  ngAfterViewInit(){
    if(!this.chart) return;
    this.chart_context = this.chart?.nativeElement.getContext("2d") as CanvasRenderingContext2D;
    
    this.eventsSubscription = this.signalService.message$.subscribe(() => {  
      if(this.core_number >=0 ){
        this.update_chart();
      }
      
    });
  }
  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  private update_chart() {
    this.chart_context.clearRect(0,0,240,100);
    this.chart_context.beginPath();
    for(let i = 0; i < this.core_data.length - 1;  i++){
      this.chart_context?.moveTo(i*2, 100-(this.core_data[i]));
      this.chart_context?.lineTo((i+1)*2, 100-(this.core_data[i+1]));
    }
    this.chart_context?.stroke();

  }


  /* public clear(){
    let chart_context = this.chart?.nativeElement.getContext("2d");
    chart_context?.clearRect(0,0,240,100);
  } */

}
