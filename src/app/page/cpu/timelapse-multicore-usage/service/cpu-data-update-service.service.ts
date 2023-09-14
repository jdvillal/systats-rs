import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CpuDataUpdateServiceService {

  constructor() { }

  private messageSource = new Subject<void>();
  message$ = this.messageSource.asObservable();

  sendMessage(){
    this.messageSource.next();
  }

}
