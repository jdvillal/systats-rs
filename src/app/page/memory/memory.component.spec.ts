import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryComponent } from './memory.component';

describe('MemoryComponent', () => {
  let component: MemoryComponent;
  let fixture: ComponentFixture<MemoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemoryComponent]
    });
    fixture = TestBed.createComponent(MemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
