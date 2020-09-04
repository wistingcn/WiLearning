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
import { Subject } from 'rxjs';

export interface IEventType {
  type: string|number;
  data?: any;
  error?: string;
}

export enum EventType {
  socket_connected = 1,
  socket_disconnected,

  media_newPeer,
  media_peerClose,
  media_consumerClosed,
  media_consumerPaused,
  media_consumerResumed,
  media_newConsumer,
  media_consumerScore,

  chat_message,
  chat_emoji,

  popover_docSelectClosed,
  popover_settingClosed,
  popover_emojiClosed,
  popover_shareClosed,
  popover_moreClosed,

  document_docSelect,
  document_docImport,
  document_syncDocInfo,

  pdftranscode_start,
  pdftranscode_end,
  pdftranscode_progress,

  class_start,
  class_stop,
  class_connectVideo,
  class_connectApproval,
  class_disconnectVideo,
  class_announcementTextChange,

  draw_action,
}

@Injectable({
  providedIn: 'root'
})
export class EventbusService {
  public socket$ = new Subject();
  public media$ = new Subject();
  public chat$ = new Subject();
  public popover$ = new Subject();
  public pdftranscode$ = new Subject();
  public document$ = new Subject();
  public class$ = new Subject();
  public draw$ = new Subject();

  constructor() { }
}
