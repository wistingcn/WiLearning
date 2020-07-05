import { TestBed } from '@angular/core/testing';

import { ChatService } from './chat.service';
import { PeerService } from './peer.service';
import { WebsocketService } from './websocket.service';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ProfileService } from './profile.service';


describe('ChatService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [PeerService, WebsocketService, EventbusService, ProfileService]
  }));

  it('should be created', () => {
    const service: ChatService = TestBed.get(ChatService);
    expect(service).toBeTruthy();
  });
});
