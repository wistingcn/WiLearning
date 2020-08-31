import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PeerService } from '../../service/peer.service';
import { DocumentService, ClaDocPages, ClaDocs } from '../../service/document.service';
import { LoggerService } from '../../service/logger.service';
import { DrawtoolService } from '../../service/drawtool.service';
import { EventbusService, IEventType, EventType } from '../../service/eventbus.service';
import { WebsocketService } from '../../service/websocket.service';
import { ClahttpService } from '../../service/clahttp.service';
import { fabric } from 'fabric';
import { getImageMeta } from '../../defines';
import { ProfileService } from '../../service/profile.service';
import { DocImagesUrl } from '../../config';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit, AfterViewInit {
  @ViewChild('can', {static: false}) canvasEle: ElementRef;
  @ViewChild('canvascontainer', {static: false}) container: ElementRef;

  docInfo: ClaDocs;
  pageNum = 1;
  numPages = 1;
  disable = false;
  fabCanvas: fabric.Canvas;
  selectedPages;
  selectedPage;
  docUrl: URL;

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
    private socket: WebsocketService,
    private clahttp: ClahttpService,
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
    this.eventbus.docoment$.subscribe((event: IEventType) => {
      if ( event.type === EventType.document_docSelect) {
        this.docSelect(event.data.doc);
      }
      if ( event.type === EventType.document_docImport) {
        this.docImport(event.data.doc);
      }

      // recv from speaker
      if ( event.type === EventType.document_syncDocInfo) {
        this.attendeeSyncDoc(event.data);
      }
    });

    this.eventbus.media$.subscribe((event: IEventType) => {
      const { type } = event;
      if ( type === EventType.media_newPeer ) {
        if ( this.profile.bClassStarter ) {
          this.sendSyncDocInfo();
        }
      }
    });

  }

  claInit() {
    this.canvasEle.nativeElement.width = this.container.nativeElement.clientWidth;
    this.canvasEle.nativeElement.height = this.container.nativeElement.clientHeight;

    this.fabCanvas = new fabric.Canvas(this.canvasEle.nativeElement);
    this.drawtool.setDocument(this);

    this.fabCanvas.setBackgroundColor('white', null);
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

  async docSelect(doc) {
    this.docUrl = new URL(DocImagesUrl + '/' + this.profile.roomId + '/' + doc.id, window.location.origin);
    this.selectedPages = await this.clahttp.http.get(this.docUrl.href).toPromise();
    this.logger.debug('docSelect pages %s', JSON.stringify(this.selectedPages));

    this.docInfo = new ClaDocs(doc.fileName);
    this.docInfo.id = doc.id;
    this.docInfo.uploadTime = doc.uploadTime;
    this.docInfo.numPages = this.numPages = this.selectedPages.length;
    this.docInfo.pages = this.selectedPages;
    this.ds.docsMap.set(doc.fileName, this.docInfo);

    this.pageNum = 1;
    await this.goPage(this.pageNum);
  }

  async renderPage(pageNum: number) {
    const path = this.getPagePath(pageNum);
    this.logger.debug(path);
    const image = await getImageMeta(path);
    await this.renderImageUrl(image.width, image.height, path);
  }

  public getPagePath(pageNum: number) {
    const page = this.selectedPages.find(ele => +ele.page === pageNum);
    if ( !page ) {
      this.logger.error('Do not find page, file: %s, pageNum: %s', this.docInfo.fileName, pageNum);
    }
    return this.singlePagePath(page.path);
  }

  public singlePagePath(path) {
    return this.docUrl.origin + '/' + path;
  }

  docImport(doc) {

  }

  async renderImageUrl(width, height, url) {
    this.logger.debug('render Image, width: %s, height: %s, url: %s', width, height, url);

    const recomputeWidth = width;
    const recomputeHeight = height;

    this.fabCanvas.clear();

    this.fabCanvas
      .setWidth(recomputeWidth)
      .setHeight(recomputeHeight);

    await new Promise(resolve => this.fabCanvas.setBackgroundImage(url, () => {
      this.fabCanvas.renderAll.bind(this.fabCanvas, {
        width: recomputeWidth,
        height: recomputeHeight,
        originX: 'left',
        originY: 'top'
      })();
      resolve();
    }));
  }

  async renderSerial(pageNum: number) {
    const serial: any = this.docInfo.getSerialMap(pageNum);
    if ( ! serial ) {
      return false;
    }

    this.logger.debug('serial data: %s', serial);
    const serialObj = JSON.parse(serial);

    this.fabCanvas
      .setHeight(serialObj.backgroundImage.height)
      .setWidth(serialObj.backgroundImage.width);

    await new Promise(resolve => this.fabCanvas.loadFromJSON(serial, resolve));
    return true;
  }

  async nextPage() {
    if (this.pageNum >= this.numPages) {
      return;
    }

    if (this.disable ) {
      return;
    }

    this.serialPage(this.pageNum);
    this.pageNum++;
    await this.goPage(this.pageNum);
  }

  async prevPage() {
    if (this.pageNum <= 1) {
      return;
    }

    if (this.disable ) {
      return;
    }

    this.serialPage(this.pageNum);
    this.pageNum--;
    await this.goPage(this.pageNum);
  }

  async goPage(pageNum) {
    if (this.disable ) {
      return;
    }

    this.disable = true;

    this.fabCanvas.clear();
    if ( ! await this.renderSerial(pageNum) ) {
      await this.renderPage(pageNum);
    }

    await this.sendSyncDocInfo();

    this.selectedPage = pageNum;
    this.disable = false;
  }

  selectPage(pageNum) {
    this.logger.debug('selectPage: %s', pageNum);
    this.serialPage(this.pageNum);
    this.pageNum = pageNum;
    this.goPage(pageNum);
  }

  serialPage(pageNum) {
    this.docInfo.setSerialMap(pageNum, JSON.stringify(this.fabCanvas));
  }

  async sendSyncDocInfo() {
    const seri = {
      doc: {
        fileName: this.docInfo ? this.docInfo.fileName : '',
      },
      canvas: {
        width: this.fabCanvas.getWidth(),
        height: this.fabCanvas.getHeight()
      },
      fabric: this.fabCanvas,
    };

    const res = await this.socket.sendSyncDocInfo(seri);
    this.logger.debug('speaker syncDocInfo : %s', JSON.stringify(seri));
  }

}
