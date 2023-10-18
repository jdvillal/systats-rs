import { Component, ViewChild, HostListener, Input, EventEmitter } from '@angular/core';
import { event, invoke } from '@tauri-apps/api';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
import { AppearanceSettingComponent } from './appearance-setting/appearance-setting.component';
import { CpuPreferencesService } from 'src/app/services/cpu-preferences.service';
import { CommonModule } from '@angular/common';
import { AppComponent } from 'src/app/app.component';
import { listen } from '@tauri-apps/api/event';
import { CoreBuffer } from 'src/app/types/cpu-types';
@Component({
  selector: 'app-current-multicore-usage',
  templateUrl: './current-multicore-usage.component.html',
  styleUrls: ['./current-multicore-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule, AppearanceSettingComponent, CommonModule]
})
export class CurrentMulticoreUsageComponent {
  @Input() core_count!: number;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.chart.chart?.resize();
  }

  public barChartLegend = false;
  public barChartPlugins = [];
  
  public bars_color: string = '';
  public background_color: string = '';

  constructor(private preferencesService: CpuPreferencesService){
    this.bars_color = this.preferencesService.get_cpu_preferences().current.bars_color;
    this.background_color = this.preferencesService.get_cpu_preferences().current.background;
  }

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Usage', backgroundColor: this.bars_color}
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    //responsive:true,
    //maintainAspectRatio: false,
    //aspectRatio: 5.0, 
    scales: {
      x: { display: true, },
      y: { display: true, max: 100 }
    },
    plugins: { legend: { display: false } }
  };

  private unlisten_update_event: any;
  ngOnInit() {
    if(this.core_count){
      this.barChartData.labels = [];
      for(let i = 0; i < this.core_count; i++){
        this.barChartData.labels.push(`CPU ${i + 1}`);
      }
      invoke<any>("emit_cpu_mulitcore_historical_usage", { }).then(async ()=>{
        this.unlisten_update_event = await listen('cpu_multicore_historical_usage', (event) => {
          this.update_chart(event.payload as CoreBuffer[]);
        })
      })
    }
  }

  ngOnDestroy(){
    this.unlisten_update_event();
    invoke<any>("stop_cpu_singlecore_current_usage", { });
  }

  private update_chart(data: CoreBuffer[]){
    let chart_data: number[] = [];
    for(let corebuffer of data){
      let n = corebuffer.buffer[corebuffer.buffer.length - 1];
      chart_data.push(n);
    }
    this.barChartData.datasets[0].data = chart_data;
    this.barChartData.datasets[0].backgroundColor = this.bars_color;
    this.chart.update();
  }

}
