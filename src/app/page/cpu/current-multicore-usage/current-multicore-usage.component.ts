import { Component, ViewChild, HostListener, Input, EventEmitter } from '@angular/core';
import { event } from '@tauri-apps/api';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-current-multicore-usage',
  templateUrl: './current-multicore-usage.component.html',
  styleUrls: ['./current-multicore-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule]
})
export class CurrentMulticoreUsageComponent {
  private eventsSubscription!: Subscription;
  @Input() core_count_ready_event!: Observable<number>;

  @Input() core_count!: number;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.chart.chart?.resize();
  }

  socket!: WebSocket;
  public barChartLegend = false;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Usage' }
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

  constructor() {
  }

  ngOnInit() {
    if(this.core_count){
      this.onCoreCountReady(this.core_count);
      return
    }
    this.eventsSubscription = this.core_count_ready_event.subscribe((core_count) => {
      this.onCoreCountReady(core_count);
    });
  }

  public onCoreCountReady(core_count: number) {
    this.barChartData.labels = [];
    for (let i = 0; i < core_count; i++) {
      this.barChartData.labels.push(`core-${i + 1}`);
    }
    this.socket = new WebSocket("ws://127.0.0.1:9001");
    this.socket.onopen = () => {
      this.socket.send("cpu_current_multicore_usage")
    }
    this.socket.onmessage = (event) => {
      let data = JSON.parse(event.data) as number[]
      this.barChartData.datasets[0].data = data;
      if (this.chart) this.chart.update();
    }
  }

  ngOnDestroy(){
    if(this.eventsSubscription){
      this.eventsSubscription.unsubscribe();
    }
    //TODO: check why this close operation thows an error on console
    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      this.socket.close();
    }
  }
}
