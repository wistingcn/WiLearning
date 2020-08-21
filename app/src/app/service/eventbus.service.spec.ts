import { TestBed } from '@angular/core/testing';

import { EventbusService } from './eventbus.service';

describe('EventbusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventbusService = TestBed.get(EventbusService);
    expect(service).toBeTruthy();
  });
});
