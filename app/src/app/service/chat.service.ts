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
import { Injectable } from '@angular/core';
import { WlMessage, makeRandomString} from '../defines';
import { PeerService } from './peer.service';
import { SignalingService } from './signaling.service';
import { RequestMethod } from '../defines';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public messages: WlMessage[] = [];
  public toPeer = 'all';

  constructor(
    private peer: PeerService,
    private signaling: SignalingService,
    private eventbus: EventbusService,
    private profile: ProfileService,
  ) {
    this.eventbus.chat$.subscribe((event: IEventType) => {
      if ( event.type === EventType.chat_message) {
        const { from, chatMessage, to} = event.data;
        if (to !== 'all' || to !== this.profile.me.id) {
          return;
        }

        const peerInfo = this.peer.getPeerInfo(from);
        const claMessage = new WlMessage(
          makeRandomString(8),
          peerInfo,
          'partner',
          chatMessage,
          new Date(),
          'ok',
        );

        this.messages = [ ...this.messages, claMessage ];
      }
    });
  }

send(chatMessage: string) {
  const claMessage = new WlMessage(
    makeRandomString(8),
    this.profile.me,
    'me',
    chatMessage,
    new Date(),
    'padding'
  );

  this.messages = [ ...this.messages, claMessage ];

  this.signaling.sendRequest(
    RequestMethod.chatMessage,
    {
      chatMessage,
      from: this.profile.me.id,
      to: this.toPeer,
    }
  ).then(() => {
      claMessage.sendStatus = 'ok';
  }).catch(() => {
      claMessage.sendStatus = 'failed';
    });
  }
}
