import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PeerService } from '../../service/peer.service';
import { DocumentService, ClaDocPages, ClaDocs } from '../../service/document.service';
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
  document: ClaDocs = null;
  containerCheckIntervel = null;

  attendee = {
    image: null ,
    src : ''
  };

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
    this.eventbus.docoment$.subscribe(async (event: IEventType) => {
      if ( event.type === EventType.document_docSelect) {
        this.document = await this.ds.docSelect(event.data.doc);
        this.document.setFabCanvas(this.fabCanvas);
        this.drawtool.setDocument(this.document);
        this.document.goPage(1);
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

  claInit() {
    this.canvasEle.nativeElement.width = this.container.nativeElement.clientWidth;
    this.canvasEle.nativeElement.height = this.container.nativeElement.clientHeight;

    this.fabCanvas = new fabric.Canvas(this.canvasEle.nativeElement);
    this.fabCanvas.setBackgroundColor('white', null);

    this.document = this.ds.newWhiteboard(this.fabCanvas);
    this.drawtool.setDocument(this.document);
  }

  // when it's not a speaker
  async attendeeSyncDoc(data) {
    const { peerId, info } = data;

    if ( this.profile.me.id === peerId) {
      this.logger.error('speaker should not received doc info!');
      return;
    }

    this.logger.debug('recv remote doc sync info , from %s.', peerId);
    this.logger.debug('recv remote doc sync info : %s', JSON.stringify(info));

    const serialObj = info.fabric;
    const canvas = info.canvas;
    const doc = info.doc;

    this.fabCanvas
      .setHeight(canvas.height)
      .setWidth(canvas.width);

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
}
