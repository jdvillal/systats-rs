import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessMemoryUsageComponent } from './process-memory-usage.component';

describe('ProcessMemoryUsageComponent', () => {
  let component: ProcessMemoryUsageComponent;
  let fixture: ComponentFixture<ProcessMemoryUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessMemoryUsageComponent]
    });
    fixture = TestBed.createComponent(ProcessMemoryUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
