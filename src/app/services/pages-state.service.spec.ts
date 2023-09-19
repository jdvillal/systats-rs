import { TestBed } from '@angular/core/testing';

import { PagesStateService } from './pages-state.service';

describe('PagesStateService', () => {
  let service: PagesStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PagesStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
