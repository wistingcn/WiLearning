import { TestBed } from '@angular/core/testing';

import { PeerService } from './peer.service';
import { WebsocketService } from './websocket.service';
import { MediaService, DisplayMediaScreenShare } from './media.service';
import { LoggerService } from './logger.service';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ProfileService } from './profile.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material';
import { SharedModule } from '../misc/shared.module';

describe('PeerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      PeerService
    ],
    imports: [
      SharedModule
    ]
  }));

  it('should be created', () => {
    const service: PeerService = TestBed.get(PeerService);
    expect(service).toBeTruthy();
  });
});
