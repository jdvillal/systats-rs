import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { MemoryPreferencesService } from 'src/app/services/memory-preferences.service';

@Component({
  selector: 'app-appearance-setting',
  templateUrl: './appearance-setting.component.html',
  styleUrls: ['./appearance-setting.component.css'],
  standalone: true,
  imports: [ColorPickerModule]
})
export class AppearanceSettingComponent {
  @Input() line_color!: string;
  @Output() line_colorChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() background_color!: string;
  @Output() background_colorChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(private preferencesService: MemoryPreferencesService){
  }

  public demo_line_color!: string;
  public demo_background_color!: string;
  ngOnInit(){
    this.demo_line_color = this.line_color;
    this.demo_background_color = this.background_color;
  }

  apply_changes(){
    this.preferencesService.get_memory_preferences().timelapse.line_color = this.demo_line_color;
    this.preferencesService.get_memory_preferences().timelapse.background_color = this.demo_background_color;
    this.preferencesService.save();
    //this.bars_color = this.demo_bars_color;
    this.line_colorChange.emit(this.demo_line_color);
    this.background_colorChange.emit(this.demo_background_color);
  }


}
