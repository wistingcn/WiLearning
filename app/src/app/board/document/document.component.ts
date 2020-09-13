import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PeerService } from '../../service/peer.service';
import { DocumentService, WlDocPages, WlDocs } from '../../service/document.service';
import { LoggerService } from '../../service/logger.service';
import { DrawtoolService } from '../../service/drawtool.service';
import { EventbusService, IEventType, EventType } from '../../service/eventbus.service';
import { fabric } from 'fabric';
import { ProfileService } from '../../service/profile.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit, AfterViewInit {
  @ViewChild('can', {static: false}) canvasEle: ElementRef;
  @ViewChild('canvascontainer', {static: false}) container: ElementRef;

  fabCanvas: fabric.Canvas;
  document: WlDocs = null;
  containerCheckIntervel = null;
  isCanvasInited = false;

  attendee = {
    image: null ,
    src : ''
  };

  width;
  height;

  constructor(
    public peer: PeerService,
    private ds: DocumentService,
    private logger: LoggerService,
    private drawtool: DrawtoolService,
    private eventbus: EventbusService,
    private profile: ProfileService,
  ) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(true);
    });

    this.containerCheckIntervel = setInterval( () => {
      this.logger.debug('clientHeight: ', this.container.nativeElement.clientHeight);
      if (this.container.nativeElement.clientHeight) {
        this.claInit();

        clearInterval(this.containerCheckIntervel);
        this.containerCheckIntervel = null;
      }
    }, 100);
  }

  ngAfterViewInit() {
    this.eventbus.document$.subscribe(async (event: IEventType) => {
      if ( event.type === EventType.document_docSelect) {
        this.sendSyncDocInfo();
        this.document = await this.ds.docSelect(event.data.doc);
        this.document.setFabCanvas(this.fabCanvas);
        this.document.setZoom(this.document.zoom);
        this.document.goPage(this.document.pageNum);
      }

      // recv from speaker
      if ( event.type === EventType.document_syncDocInfo) {
        this.attendeeSyncDoc(event.data);
      }
    });

    this.eventbus.media$.subscribe((event: IEventType) => {
      const { type } = event;
      if ( type === EventType.media_newPeer ) {
        if ( this.profile.bClassStarter && document ) {
          this.document.sendSyncDocInfo();
        }
      }
    });

  }

  async claInit() {
    this.width = this.container.nativeElement.clientWidth;
    this.height = this.container.nativeElement.clientHeight;

    this.canvasEle.nativeElement.width = this.width;
    this.canvasEle.nativeElement.height = this.height;

    this.logger.debug('native width: %s ,native height: %s',
      this.container.nativeElement.clientWidth,
      this.container.nativeElement.clientHeight
    );

    this.initFabric();

    if (this.ds.selectedDoc) {
      this.document = await this.ds.docSelect(this.ds.selectedDoc);
      this.document.setFabCanvas(this.fabCanvas);
      this.document.setZoom(this.document.zoom);
      if (!this.isCanvasInited) {
        this.drawtool.setDocument(this);
      }
      return this.document.goPage(this.document.pageNum);
    }

    if (this.ds.lastDocSyncData) {
      this.logger.debug('In claInit, sync from lastDocSyncData.');
      return this.attendeeSyncDoc(this.ds.lastDocSyncData);
    }

    if (this.profile.privilege.draw) {
      this.document = this.ds.newWhiteboard(this.fabCanvas);
      this.drawtool.setDocument(this);
      this.sendSyncDocInfo();
    }
  }

  // when it's not a speaker
  async attendeeSyncDoc(data) {
    const { peerId, info } = data;

    if ( this.profile.me.id === peerId) {
      this.logger.error('speaker should not received doc info!');
      return;
    }

    const serialObj = info.fabric;
    const canvas = info.canvas;
    const doc = info.doc;

    this.width = this.container.nativeElement.clientWidth;
    this.height = this.container.nativeElement.clientHeight;
    if (!this.width) {
      this.logger.debug('the component maybe destoryed! just return.');
      return;
    }

    this.logger.debug('recv remote doc sync info , from %s.', peerId);
    this.logger.debug('recv remote doc sync info : %s', JSON.stringify(info));
    this.logger.debug('canvas width: %s, canvas height: %s', canvas.width, canvas.height);
    this.logger.debug('native width: %s, native height: %s', this.width, this.height);

    this.setCanvasZoom(canvas.width, canvas.height);

    if (! serialObj.backgroundImage ) {
      await new Promise(resolve => this.fabCanvas.loadFromJSON(serialObj, resolve));
      return;
    }

    const src = serialObj.backgroundImage.src;
    this.logger.debug('serialObj src: %s', src);
    let image = this.attendee.image;
    if ( this.attendee.src !== src ) {
      image = await new Promise(resolve => fabric.Image.fromURL(src, resolve));
      this.attendee.image = image;
      this.attendee.src = src;
    }

    // do not want load backgroundImage everytime
    delete serialObj.backgroundImage;

    await new Promise(resolve => this.fabCanvas.loadFromJSON(serialObj, resolve));
    await new Promise(resolve => this.fabCanvas.setBackgroundImage(image, resolve));

    // without this, peer can move/modify cavans object
    this.fabCanvas.forEachObject((element) => element.selectable = false );

    this.fabCanvas.renderAll();
  }

  setCanvasZoom(width, height) {
    this.fabCanvas.setZoom(1);
    if (this.width > width) {
      this.fabCanvas.setWidth(width).setHeight(height);
      (this.container.nativeElement as HTMLDivElement).style.height = height + 'px';
      return;
    }

    const zoom = Math.floor(this.width / width * 100) / 100;

    this.logger.debug('canvas width: %s, native width: %s, zoom: %s',
      width, this.width, zoom);
    this.fabCanvas.setHeight(height * zoom);
    (this.container.nativeElement as HTMLDivElement).style.height = height * zoom + 'px';
    this.fabCanvas.setZoom(zoom);
  }

  async sendSyncDocInfo() {
    if (this.document) {
      await this.document.sendSyncDocInfo();
    }
  }

  initFabric() {
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = 'blue';
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.hasControls = false;

    this.fabCanvas = new fabric.Canvas(this.canvasEle.nativeElement);
    this.fabCanvas.setBackgroundColor('white', null);
  }
}
