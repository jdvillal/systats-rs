import { Component, Input } from '@angular/core';
import { appWindow } from '@tauri-apps/api/window'
import { OS_type } from '../types/app-types';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.css'],
  //imports: [CommonModule]
})
export class TitleBarComponent {
  @Input() darkmode!: boolean;

  public user_OS: OS_type = 'Unknown;'
  constructor(){
    if (window.navigator.userAgent.indexOf("Windows") != -1) {
      //console.log("The user is running Windows");
      this.user_OS = 'Windows';
    } else if (window.navigator.userAgent.indexOf("Mac OS") != -1) {
      //console.log("The user is running Mac OS");
      this.user_OS = 'MacOS';
    } else if (window.navigator.userAgent.indexOf("Linux") != -1) {
      //console.log("The user is running Linux");
      this.user_OS = 'Linux';
    } else {
      this.user_OS = 'Linux'
      //console.log("The user's operating system could not be determined");
    }
  }

  public toggle_minimize(){
    appWindow.minimize();
  }
  public toggle_maximize(){
    appWindow.toggleMaximize();
  }
  public close(){
    appWindow.close();
  }
}
