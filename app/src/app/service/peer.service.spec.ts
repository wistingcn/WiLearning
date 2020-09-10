import { TestBed } from '@angular/core/testing';

import { PeerService } from './peer.service';
describe('PeerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      PeerService
    ],
    imports: [
    ]
  }));

  it('should be created', () => {
    const service: PeerService = TestBed.get(PeerService);
    expect(service).toBeTruthy();
  });
});
