import { CommonModule } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-current-singlecore-usage',
  templateUrl: './current-singlecore-usage.component.html',
  styleUrls: ['./current-singlecore-usage.component.css'],
  standalone: true,
  imports: [TranslateModule, CommonModule]
})
export class CurrentSinglecoreUsageComponent {
  private socket!: WebSocket;
  public current_utilization!: number;

  private unlisten_update_event: any;

  constructor(private ngZone: NgZone){}

  ngOnInit() {
    this.unlisten_update_event = invoke<any>("emit_cpu_singlecore_current_usage", { }).then(async ()=>{
        this.unlisten_update_event = listen('cpu_singlecore_current_usage', (event) => {
          this.update_ui(event.payload as number);
        });
    })
  }

  update_ui(value: number){
    this.ngZone.run(() => {
      this.current_utilization = Math.round(value * 100) / 100;
    })
  }

  ngOnDestroy(){
    this.unlisten_update_event();
    invoke<any>("stop_cpu_singlecore_current_usage", { });
  }

}
