import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentSinglecoreUsageComponent } from './current-singlecore-usage.component';

describe('CurrentSinglecoreUsageComponent', () => {
  let component: CurrentSinglecoreUsageComponent;
  let fixture: ComponentFixture<CurrentSinglecoreUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentSinglecoreUsageComponent]
    });
    fixture = TestBed.createComponent(CurrentSinglecoreUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
