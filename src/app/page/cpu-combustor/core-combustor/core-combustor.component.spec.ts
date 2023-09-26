import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreCombustorComponent } from './core-combustor.component';

describe('CoreCombustorComponent', () => {
  let component: CoreCombustorComponent;
  let fixture: ComponentFixture<CoreCombustorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreCombustorComponent]
    });
    fixture = TestBed.createComponent(CoreCombustorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
