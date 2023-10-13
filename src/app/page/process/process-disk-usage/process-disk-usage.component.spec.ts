import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessDiskUsageComponent } from './process-disk-usage.component';

describe('ProcessDiskUsageComponent', () => {
  let component: ProcessDiskUsageComponent;
  let fixture: ComponentFixture<ProcessDiskUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessDiskUsageComponent]
    });
    fixture = TestBed.createComponent(ProcessDiskUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
