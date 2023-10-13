import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCpuUsageComponent } from './process-cpu-usage.component';

describe('ProcessCpuUsageComponent', () => {
  let component: ProcessCpuUsageComponent;
  let fixture: ComponentFixture<ProcessCpuUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessCpuUsageComponent]
    });
    fixture = TestBed.createComponent(ProcessCpuUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
