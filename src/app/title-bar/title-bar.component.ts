import { Component } from '@angular/core';
import { appWindow } from '@tauri-apps/api/window'
@Component({
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.css']
})
export class TitleBarComponent {


  public toggle_minimize(){
    appWindow.minimize();
  }
  public toggle_maximiza(){
    appWindow.toggleMaximize();
  }
  public close(){
    appWindow.close();
  }
}
