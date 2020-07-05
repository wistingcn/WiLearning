import { TestBed, async, inject } from '@angular/core/testing';

import { GuardGuard } from './guard.guard';

describe('GuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GuardGuard]
    });
  });

  it('should ...', inject([GuardGuard], (guard: GuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
