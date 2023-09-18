import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimelapseSingleUsageComponent } from '../timelapse-single-usage/timelapse-single-usage.component';
import { CpuDataUpdateNotifierService } from '../service/cpu-data-update-notifier.service';
import { CpuPreferencesService } from 'src/app/services/cpu-preferences.service';

@Component({
  selector: 'app-appearance-setting',
  templateUrl: './appearance-setting.component.html',
  styleUrls: ['./appearance-setting.component.css'],
  standalone: true,
  imports: [TimelapseSingleUsageComponent]
})
export class AppearanceSettingComponent {
  @Input() x_scale!: number;
  @Input() y_scale!: number;
  @Input() line_color!: string;
  @Output() x_scaleChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() y_scaleChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() line_colorChange: EventEmitter<string> = new EventEmitter<string>();

  public demo_x_scale = 1;
  public demo_y_scale = 1;
  public demo_line_color!: string;

  public demo_data = [0,1.9607844,2,0,0,2,3.9215689,18,18,0,0,6.122449,8,0,2,4.166667,1.9607844,2,0,0,0,2,0,0,4,4,0,5.769231,4.0816326,4,2,2,4,5.769231,4,4,5.769231,0,5.882353,5.882353,7.692308,4,0,7.692308,10,3.9215689,0,2,2,3.846154,0,3.9215689,0,2,8,4.0816326,4,4,11.764706,4.0816326,3.9215689,2.0408163,3.9215689,0,0,1.9607844,3.9215689,4,8.163265,6,4,8,4.0816326,6,16.32653,14,2,4.0816326,4.0816326,24,0,30.769232,0,6.122449,2,14,4,6,4.0816326,0,34,0,20.833332,0,15.6862755,2.0408163,2,13.725491,2,4,6.122449,8,14,25.490198,18.367348,6.122449,12,4,8,14.285715,6,5.769231,7.8431377,10.204082,14,2,8.163265,8,10,10];

  constructor(private update_notifier: CpuDataUpdateNotifierService, private prefService: CpuPreferencesService){}

  ngOnInit(){
    this.demo_x_scale = this.x_scale;
    this.demo_y_scale = this.y_scale;
    this.demo_line_color = this.line_color;
  }

  public set_x_scale(new_x_scale: string){
    this.demo_x_scale = Number.parseFloat(new_x_scale);
  }

  public set_y_scale(new_y_scale: string){
    this.demo_y_scale = Number.parseFloat(new_y_scale);
  }

  public set_chart_color(new_color: string){
    //console.log(new_color);
    this.demo_line_color = new_color;
    this.update_notifier.notifyAll();
  }

  public apply_changes(){
    this.x_scaleChange.emit(this.demo_x_scale)
    this.y_scaleChange.emit(this.demo_y_scale)
    this.line_colorChange.emit(this.demo_line_color);
    //console.log('before => ',this.prefService.get_cpu_preferences());
    this.prefService.get_cpu_preferences().timelapse.x_scale = this.demo_x_scale;
    this.prefService.get_cpu_preferences().timelapse.y_scale = this.demo_y_scale;
    this.prefService.get_cpu_preferences().timelapse.line_color = this.demo_line_color;
    this.prefService.save();
    //console.log('after => ',this.prefService.get_cpu_preferences());
    
  }

}
