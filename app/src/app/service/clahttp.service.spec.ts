import { TestBed } from '@angular/core/testing';

import { ClahttpService } from './clahttp.service';

describe('ClahttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClahttpService = TestBed.get(ClahttpService);
    expect(service).toBeTruthy();
  });
});
