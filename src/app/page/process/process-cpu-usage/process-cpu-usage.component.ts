import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ColorPickerModule } from 'ngx-color-picker';
import { Observable, Subscription } from 'rxjs';
import { ProcessPreferencesService } from 'src/app/services/process-preferences.service';
import { ProcessPreferences } from 'src/app/types/process';
@Component({
  selector: 'app-process-cpu-usage',
  templateUrl: './process-cpu-usage.component.html',
  styleUrls: ['./process-cpu-usage.component.css'],
  standalone: true,
  imports: [CommonModule, NgChartsModule, ColorPickerModule]
})
export class ProcessCpuUsageComponent {
  private onDataUpdateEventSubscription!: Subscription;
  @Input() data!: number[];
  @Input() data_update_observable!: Observable<void>;


  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public preferences: ProcessPreferences = this.process_preferences.get_preferences();

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
      scales: { x: { display: false }, y: { max: 100 } },
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
    this.lineChartData.datasets[0].borderColor = this.preferences.cpu_usage_chart.process_lines_color;
    this.chart.update();
  }

  get_current_usage(): number{
    let usage = this.data[this.data.length - 1];
    return Math.round(usage * 100) / 100
  }



  /****************Appearance settings logic*****************/

  public demo_process_lines_color = this.preferences.cpu_usage_chart.process_lines_color;
  public demo_background_color = this.preferences.cpu_usage_chart.background_color;

  reset_settings(){
    this.demo_process_lines_color = this.preferences.cpu_usage_chart.process_lines_color;
    this.demo_background_color = this.preferences.cpu_usage_chart.background_color;
  }

  apply_settings(){
    this.preferences.cpu_usage_chart.process_lines_color = this.demo_process_lines_color;
    this.preferences.cpu_usage_chart.background_color = this.demo_background_color;
    this.process_preferences.save();
  }

}
