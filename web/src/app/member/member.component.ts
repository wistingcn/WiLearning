import { Component, OnInit } from '@angular/core';
import { PeerService } from '../service/peer.service';
import { EventbusService, IEventType, EventType } from '../service/eventbus.service';
import { ProfileService } from '../service/profile.service';
import { LoggerService } from '../service/logger.service';
import { CONNECT_VIDEO_STATUS } from '../defines';
import { WebsocketService } from '../service/websocket.service';
import { RequestConnectVideoTimeout } from '../config';
import { I18nService } from '../service/i18n.service';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit {

  constructor(
    public peer: PeerService,
    public profile: ProfileService,
    public i18n: I18nService,
    private eventbus: EventbusService,
    private logger: LoggerService,
    private socket: WebsocketService,
  ) { }

  ngOnInit() {
    this.eventbus.class$.subscribe((event: IEventType) => {
      if ( event.type === EventType.class_connectVideo ) {
        if ( this.profile.privilege.classControl ) {
          const { peerId } = event.data;
          this.logger.debug('peer %s request connect video', peerId);

          const peer = this.peer.getPeerInfo(peerId);
          peer.connectVideoStatus = CONNECT_VIDEO_STATUS.Requested;

          setTimeout(() => {
            if ( peer.connectVideoStatus === CONNECT_VIDEO_STATUS.Requested ) {
              peer.connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
            }
          }, RequestConnectVideoTimeout * 1000);
        }
      }
    });
  }

  connectApproval( peerId, bool) {
    this.socket.sendConnectApproval(peerId, bool);
    const peer = this.peer.getPeerInfo(peerId);
    peer.connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
  }

  disconnectVideo( peerId ) {
    this.socket.sendDisconnectVideo(peerId);
  }
}
