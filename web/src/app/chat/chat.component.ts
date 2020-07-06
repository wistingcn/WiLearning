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
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ChatService } from '../service/chat.service';
import { LoggerService } from '../service/logger.service';
import { EventbusService, IEventType, EventType } from '../service/eventbus.service';
import { emoji } from '../misc/emoji';
import { I18nService } from '../service/i18n.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  newMessage = '';
  emojiRef = emoji;
  emojiArray: Array<string> = [];
  @ViewChild('scrollbar', {static: false} ) scrollbar;

  constructor(
    public i18n: I18nService,
    public chat: ChatService,
    private logger: LoggerService,
    private eventbus: EventbusService,
  ) { }

  ngOnInit() {
    this.eventbus.chat$.subscribe((event: IEventType) => {
      if ( event.type === EventType.chat_message) {
        setTimeout(() => {
          this.scrollbar.directiveRef.scrollToBottom(0);
        }, 200);
      }
    });

    for ( const kind of emoji ) {
      for ( const ele of kind.emojis ) {
        this.emojiArray.push(ele.emoji);
      }
    }
  }

  onSendTriggered() {
    if ( !this.newMessage.trim().length ) {
      this.newMessage = '';
      return ;
    }

    this.chat.send(this.newMessage);
    this.newMessage = '';

    setTimeout(() => {
      this.scrollbar.directiveRef.scrollToBottom(0);
    }, 200);
  }

  emojiSelect(event) {
    this.newMessage += event.target.innerText;
  }

  timeFormat(time: string) {
    const tt = new Date(time);
    const hours = tt.getHours();
    const hoursString = hours < 10 ? '0' + hours : hours.toString();
    const minutes = tt.getMinutes();
    const minutesString = minutes < 10 ? '0' + minutes : minutes.toString();

    return hoursString + ':' + minutesString;
  }
}
