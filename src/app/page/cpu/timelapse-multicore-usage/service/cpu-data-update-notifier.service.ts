import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CpuDataUpdateNotifierService {

  constructor() { }

  private messageSource = new Subject<void>();
  message$ = this.messageSource.asObservable();

  notifyAll(){
    this.messageSource.next();
  }
}
