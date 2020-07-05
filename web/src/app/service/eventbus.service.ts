import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';

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

  overlay_shareMediaClosed,
  overlay_pdfSelectClosed,
  overlay_settingClosed,

  document_docSelect,
  document_docImport,
  document_syncDocInfo,

  pdftranscode_start,
  pdftranscode_end,
  pdftranscode_progress,

  nav_topVideoViewInit,
  nav_topVideoViewDestroy,

  class_start,
  class_stop,
  class_connectVideo,
  class_connectApproval,
  class_disconnectVideo,
  class_announcementTextChange,
}

@Injectable({
  providedIn: 'root'
})
export class EventbusService {
  public socket$ = new Subject();
  public media$ = new Subject();
  public chat$ = new Subject();
  public overlay$ = new Subject();
  public pdftranscode$ = new Subject();
  public docoment$ = new Subject();
  public nav$ = new Subject();
  public selectedTab = new FormControl(0);
  public class$ = new Subject();

  constructor() { }
}
