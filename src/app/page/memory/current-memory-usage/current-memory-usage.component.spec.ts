import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentMemoryUsageComponent } from './current-memory-usage.component';

describe('CurrentMemoryUsageComponent', () => {
  let component: CurrentMemoryUsageComponent;
  let fixture: ComponentFixture<CurrentMemoryUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentMemoryUsageComponent]
    });
    fixture = TestBed.createComponent(CurrentMemoryUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
