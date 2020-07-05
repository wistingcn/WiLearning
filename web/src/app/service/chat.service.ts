import { Injectable } from '@angular/core';
import { ClaMessage, makeRandomString} from '../defines';
import { PeerService } from './peer.service';
import { WebsocketService } from './websocket.service';
import { RequestMethod } from '../defines';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public messages: ClaMessage[] = [];

  constructor(
    private peer: PeerService,
    private socket: WebsocketService,
    private eventbus: EventbusService,
    private profile: ProfileService,
  ) {
    this.eventbus.chat$.subscribe((event: IEventType) => {
      if ( event.type === EventType.chat_message) {
        const { peerId, chatMessage } = event.data;
        const peerInfo = this.peer.getPeerInfo(peerId);

        const claMessage = new ClaMessage(
          makeRandomString(8),
          peerInfo,
          'partner',
          chatMessage,
          new Date(),
          'sended',
        );

        this.messages = [ ...this.messages, claMessage ];
      }
    });
  }

send(chatMessage: string) {
    const claMessage = new ClaMessage(
      makeRandomString(8),
      this.profile.me,
      'me',
      chatMessage,
      new Date(),
      'padding'
    );

    this.messages = [ ...this.messages, claMessage ];

    this.socket.sendRequest(
      RequestMethod.chatMessage,
      {chatMessage}
    ).then(() => {
        claMessage.sendStatus = 'sended';
    }).catch(() => {
        claMessage.sendStatus = 'failed';
      });
  }
}
