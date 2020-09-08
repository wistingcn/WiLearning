import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { MenuController, Platform, ToastController, PopoverController, ModalController } from '@ionic/angular';

import { SharepopoverComponent } from '../popover/sharepopover/sharepopover.component';
import { NetstatComponent } from '../popover/netstat/netstat.component';
import { SettingComponent } from '../popover/setting/setting.component';
import { MoreComponent } from '../popover/more/more.component';
import { ProfileService } from '../service/profile.service';
import { PeerService } from '../service/peer.service';
import { SignalingService } from '../service/signaling.service';
import { LoggerService } from '../service/logger.service';
import { ChatService } from '../service/chat.service';
import { EmojiComponent } from '../popover/emoji/emoji.component';
import { EventbusService, IEventType, EventType } from '../service/eventbus.service';
import { ClassroomService } from '../service/classroom.service';
import { WlBoardComp } from '../defines';
import { DocselectComponent } from '../popover/docselect/docselect.component';
import { DocumentService } from '../service/document.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  loggedIn = false;
  menuPage = 'member';

  inputMessage = '';

  mediaFile: File;
  shareScreenValid = true;
  shareMediaValid = true;
  requestConnectTimeout;
  bFullscreen = false;
  recordedChunks = [];
  mediaRecorder;
  recorderStart = false;
  recorderIntervalHandler;
  recordingIconSize = false;
  recorderEnable = false;
  boardcomp = WlBoardComp;

  popoverEmoji = null;
  popoverSetting = null;
  popoverShare = null;
  popoverMore = null;

  constructor(
    public profile: ProfileService,
    public peer: PeerService,
    public chat: ChatService,
    public classroom: ClassroomService,
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private signaling: SignalingService,
    private logger: LoggerService,
    private eventbus: EventbusService,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private ds: DocumentService,
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    this.eventbus.chat$.subscribe((event: IEventType) => {
      if (event.type === EventType.chat_emoji) {
        this.inputMessage += event.data;
      }
    });

    this.eventbus.popover$.subscribe((event: IEventType) => {
      if (event.type === EventType.popover_emojiClosed && this.popoverEmoji) {
        this.popoverEmoji.dismiss();
        this.popoverEmoji = null;
      }

      if (event.type === EventType.popover_settingClosed && this.popoverSetting) {
        this.popoverSetting.dismiss();
        this.popoverSetting = null;
      }

      if (event.type === EventType.popover_shareClosed && this.popoverShare) {
        this.popoverShare.dismiss();
        this.popoverShare = null;
      }

      if (event.type === EventType.popover_moreClosed && this.popoverMore) {
        this.popoverMore.dismiss();
        this.popoverMore = null;
      }
    });

    this.eventbus.document$.subscribe((event: IEventType) => {
      if (event.type === EventType.document_syncDocInfo && event.data.peerId !== this.profile.me.id) {
        this.profile.switchBoardComponent(WlBoardComp.document);
        this.ds.lastDocSyncData = event.data;
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.signaling.connect();
    });

    this.platform.resize.subscribe((event) => {
      this.logger.debug(`resize event, width:${window.innerWidth}, height: ${window.innerHeight}`);
    });

    (window as any).peer = this.peer;

  }

  async sharePopover(ev) {
    const popover = await this.popoverController.create({
      component: SharepopoverComponent,
      event: ev,
      translucent: true
    });
    await popover.present();
    this.popoverShare = popover;
  }

  async morePopover(ev) {
    const popover = await this.popoverController.create({
      component: MoreComponent,
      event: ev,
      translucent: true
    });
    await popover.present();
    this.popoverMore = popover;
  }

  async settingPopover() {
    const popover = await this.modalController.create({
      component: SettingComponent
    });

    await popover.present();
    this.popoverSetting = popover;
  }

  async netstatPopover(ev) {
    const popover = await this.popoverController.create({
      component: NetstatComponent,
      event: ev,
      translucent: true
    });
    return popover.present();
  }

  segmentChanged(ev) {
    this.menuPage = ev.detail.value;
  }

  openMember() {
    this.menu.open();
    document.getElementById('memberButton').click();
  }

  openChat() {
    this.menu.open();
    document.getElementById('chatButton').click();
  }

  sendToChange(ev) {
    this.logger.debug(ev.detail.value);
  }

  sendMessage() {
    const message = this.inputMessage.replace(/[\r\n]$/, '');
    message.trim();
    if ( message) {
      this.chat.send(message);
    }
    this.inputMessage = '';
  }

  async openEmoji(ev) {
    const popover = await this.popoverController.create({
      component: EmojiComponent,
      event: ev,
      translucent: true
    });

    this.popoverEmoji = popover;
    return popover.present();
  }
}
