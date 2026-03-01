import { TestBed } from '@angular/core/testing';

import { LocalisationStateService } from './localisation.service';

describe('LocalisationService', () => {
  let service: LocalisationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalisationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
