import { TestBed } from '@angular/core/testing';

import { EventbusService } from './eventbus.service';

describe('EventbusService', () => {
  let service: EventbusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventbusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
