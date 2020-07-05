/*
	 * Copyright (c) 2020 Wisting Team. <linewei@gmail.com>
	 *
	 * This program is free software: you can use, redistribute, and/or modify
	 * it under the terms of the GNU Affero General Public License, version 3
	 * or later ("AGPL"), as published by the Free Software Foundation.
	 *
	 * This program is distributed in the hope that it will be useful, but WITHOUT
	 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
	 * FITNESS FOR A PARTICULAR PURPOSE.
	 *
	 * You should have received a copy of the GNU Affero General Public License
	 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
