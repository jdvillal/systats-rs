import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { CpuPreferencesService } from 'src/app/services/cpu-preferences.service';

@Component({
  selector: 'app-appearance-setting',
  templateUrl: './appearance-setting.component.html',
  styleUrls: ['./appearance-setting.component.css'],
  standalone: true,
  imports: [ColorPickerModule]
})
export class AppearanceSettingComponent {
  @Input() bars_color!: string;
  @Output() bars_colorChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() background_color!: string;
  @Output() background_colorChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(private prefrencesService: CpuPreferencesService){
  }


  public demo_bars_color!: string;
  public demo_background_color!: string;
  ngOnInit(){
    this.demo_bars_color = this.bars_color;
    this.demo_background_color = this.background_color;
  }

  


  apply_changes(){
    this.prefrencesService.get_cpu_preferences().current.bars_color = this.demo_bars_color;
    this.prefrencesService.get_cpu_preferences().current.background = this.demo_background_color;
    this.prefrencesService.save();
    //this.bars_color = this.demo_bars_color;
    this.bars_colorChange.emit(this.demo_bars_color);
    this.background_colorChange.emit(this.demo_background_color);
  }



}
