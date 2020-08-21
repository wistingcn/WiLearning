import { TestBed } from '@angular/core/testing';

import { DrawtoolService } from './drawtool.service';

describe('DrawtoolService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DrawtoolService = TestBed.get(DrawtoolService);
    expect(service).toBeTruthy();
  });
});
