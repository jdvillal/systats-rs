import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ColorPickerModule } from 'ngx-color-picker';
import { Observable, Subscription } from 'rxjs';
import { ProcessPreferencesService } from 'src/app/services/process-preferences.service';

@Component({
  selector: 'app-process-disk-usage',
  templateUrl: './process-disk-usage.component.html',
  styleUrls: ['./process-disk-usage.component.css'],
  standalone: true,
  imports: [CommonModule, NgChartsModule, ColorPickerModule]
})
export class ProcessDiskUsageComponent {
  private onDataUpdateEventSubscription!: Subscription;
  @Input() data!: number[];
  @Input() data_update_observable!: Observable<void>;


  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public preferences = this.process_preferences.get_preferences();

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: ' usage',
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
        borderColor: '',
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {};
  public lineChartLegend = false;

  constructor(private process_preferences: ProcessPreferencesService){}

  ngOnInit() {}

  ngAfterViewInit(){
    this.lineChartOptions = {
      animation: false,
      scales: { x: { display: false }, y: { min: 0 } },
      plugins: { legend: { display: false } }
    };
    this.onDataUpdateEventSubscription = this.data_update_observable.subscribe(() => {
      this.update_chart();
    })
  }

  ngOnDestroy() {
    if(this.onDataUpdateEventSubscription){
      this.onDataUpdateEventSubscription.unsubscribe()
    }
  }

  update_chart() {
    let labels = []
    for (let i = 0; i < this.data.length; i++) {
      labels.push('')
    }
    this.lineChartData.labels = labels;
    this.lineChartData.datasets[0].data = this.data;
    this.lineChartData.datasets[0].borderColor = this.preferences.disk_usage_chart.read_line_chart_color;
    this.chart.update();
  }

  /*********************chart appearance settings ************** */

  public demo_read_lines_color = this.preferences.disk_usage_chart.read_line_chart_color;
  public demo_write_lines_color = this.preferences.disk_usage_chart.write_line_chart_color;
  public demo_background_color = this.preferences.disk_usage_chart.background_color;

  reset_settings(){
    this.demo_read_lines_color = this.preferences.disk_usage_chart.read_line_chart_color;
    this.demo_write_lines_color = this.preferences.disk_usage_chart.write_line_chart_color;
    this.demo_background_color = this.preferences.disk_usage_chart.background_color;
  }

  apply_settings(){
    this.preferences.disk_usage_chart.read_line_chart_color = this.demo_read_lines_color;
    this.preferences.disk_usage_chart.write_line_chart_color = this.demo_write_lines_color;
    this.preferences.disk_usage_chart.background_color = this.demo_background_color;
    this.process_preferences.save();
  }

}
