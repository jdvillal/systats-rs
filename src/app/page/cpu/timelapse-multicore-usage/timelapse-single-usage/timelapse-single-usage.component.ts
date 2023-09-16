import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription, fromEvent } from 'rxjs';
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

  @Input() core_number: number = 0;//todo: delete this
  @Input() core_data: number[] = [];
  @Input() x_scale = 1;
  @Input() y_scale = 1;

  @ViewChild('core_chart') chart?: ElementRef<HTMLCanvasElement>;

  chart_context!: CanvasRenderingContext2D;

  default_width = 120;
  default_height = 100;
  //x_scale = 1.5;
  //y_scale = 0.5;

  constructor(
    private signalService: CpuDataUpdateServiceService
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
    if (!this.chart) return;
    this.chart_context = this.chart?.nativeElement.getContext("2d") as CanvasRenderingContext2D;

    this.eventsSubscription = this.signalService.message$.subscribe(() => {
      if (this.core_number >= 0) {
        this.update_chart();
      }

    });
  }
  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  private update_chart() {
    this.chart_context.clearRect(0, 0, 120 * this.x_scale, 100 * this.y_scale);
    this.chart_context.beginPath();
    for (let i = 0; i < this.core_data.length - 1; i++) {
      this.chart_context?.moveTo(i * this.x_scale, (100 * this.y_scale) - (this.core_data[i] * this.y_scale));
      this.chart_context?.lineTo((i + 1) * this.x_scale, (100 * this.y_scale) - (this.core_data[i + 1] * this.y_scale));
    }
    this.chart_context.strokeStyle = "#bd1934"//"#bd153f"
    this.chart_context?.stroke();

  }


}
