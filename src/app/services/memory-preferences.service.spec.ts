import { TestBed } from '@angular/core/testing';

import { MemoryPreferencesService } from './memory-preferences.service';

describe('MemoryPreferencesService', () => {
  let service: MemoryPreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemoryPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
