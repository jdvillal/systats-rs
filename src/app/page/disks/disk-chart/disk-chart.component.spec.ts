import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiskChartComponent } from './disk-chart.component';

describe('DiskChartComponent', () => {
  let component: DiskChartComponent;
  let fixture: ComponentFixture<DiskChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiskChartComponent]
    });
    fixture = TestBed.createComponent(DiskChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
