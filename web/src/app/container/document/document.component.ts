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
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PdfService, ClaDocs } from 'src/app/service/pdf.service';
import { LoggerService } from 'src/app/service/logger.service';
import { fabric } from 'fabric';
import { EventbusService, IEventType, EventType } from 'src/app/service/eventbus.service';
import { DrawtoolService } from 'src/app/service/drawtool.service';
import { DocImagesUrl } from '../../config';
import { ProfileService } from 'src/app/service/profile.service';
import { ClahttpService } from 'src/app/service/clahttp.service';
import { WebsocketService } from 'src/app/service/websocket.service';
import { getImageMeta } from '../../defines';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements AfterViewInit {
  @ViewChild('can', {static: false}) canvasEle: ElementRef;
  @ViewChild('container', {static: false}) divContainer: ElementRef<HTMLDivElement>;

  docInfo: ClaDocs;
  pageNum = 1;
  numPages = 1;
  disable = false;
  fabCanvas: fabric.Canvas;
  selectedPages;
  selectedPage;
  docUrl: URL;
  widthOffset = 50;
  heightOffset = 20;
  isViewList = false;
  maxHeight = 500;
  maxHeightOrigin = 0;
  isCanvasInited = false;

  @Input() tab;
  activeTabIndex = 0;

  @Output() newTabDoc = new EventEmitter();

  attendee = {
    image: null ,
    src : ''
  };

  constructor(
    public profile: ProfileService,
    private pdfs: PdfService,
    private logger: LoggerService,
    private eventbus: EventbusService,
    private drawtool: DrawtoolService,
    private clahttp: ClahttpService,
    private socket: WebsocketService,
  ) {
  }

  ngAfterViewInit() {
    this.fabCanvas = new fabric.Canvas(this.canvasEle.nativeElement);
    setTimeout(() => {
      this.drawtool.setDocument(this);
    }, 0);
    this.activeTabIndex = this.tab.index;

    this.eventbus.selectedTab.valueChanges.subscribe(index => {
      this.activeTabIndex = index;
      if ( this.tab.index === index ) {
        this.logger.debug('selected index : %s', index);
        this.drawtool.setDocument(this);
        this.sendSyncDocInfo();
      }
    });

    this.eventbus.docoment$.subscribe((event: IEventType) => {
      if ( this.tab.index !== this.activeTabIndex ) {
        return;
      }

      if ( event.type === EventType.document_docSelect) {
        this.isViewList = false;
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

    this.eventbus.nav$.subscribe((event: IEventType) => {
      if ( event.type === EventType.nav_topVideoViewInit ) {
        this.maxHeightOrigin = this.maxHeight;
        this.maxHeight = this.maxHeight - 150;
      }

      if ( event.type === EventType.nav_topVideoViewDestroy) {
        this.maxHeight = this.maxHeightOrigin;
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

    this.claInit();
  }

  claInit() {
    if ( !this.divContainer.nativeElement.offsetWidth ) {
      setTimeout(() => {
        this.claInit();
      }, 50);

      return;
    }

    this.logger.debug('divContainer: %s, %s',
      this.divContainer.nativeElement.offsetWidth,
      this.divContainer.nativeElement.offsetHeight
    );

    this.fabCanvas
      .setWidth(this.divContainer.nativeElement.offsetWidth * 0.9)
      .setHeight(this.divContainer.nativeElement.offsetHeight * 0.9)
      .setBackgroundColor('white', null);

    this.maxHeight = this.divContainer.nativeElement.offsetHeight;
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

    if (doc.fileName) {
      this.newTabDoc.emit(doc.fileName);
    }

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
    this.docUrl = new URL(DocImagesUrl + '/' + this.profile.roomId + '/' + doc.id);
    this.selectedPages = await this.clahttp.http.get(this.docUrl.href).toPromise();
    this.logger.debug('docSelect pages %s', JSON.stringify(this.selectedPages));

    this.docInfo = new ClaDocs(doc.fileName);
    this.docInfo.id = doc.id;
    this.docInfo.uploadTime = doc.uploadTime;
    this.docInfo.numPages = this.numPages = this.selectedPages.length;
    this.docInfo.pages = this.selectedPages;
    this.pdfs.docsMap.set(doc.fileName, this.docInfo);
    this.newTabDoc.emit(doc.fileName);

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

    let recomputeWidth = width;
    let recomputeHeight = height;

    if ( width > this.divContainer.nativeElement.offsetWidth ) {
      recomputeWidth = this.divContainer.nativeElement.offsetWidth - this.widthOffset;
      recomputeHeight = height * recomputeWidth / width - this.heightOffset;
    }
    this.logger.debug('recomputeWidth: %s, recomputeHeight: %s', recomputeWidth, recomputeHeight);

    this.maxHeight = this.divContainer.nativeElement.offsetHeight;

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

  viewDocList() {
    this.isViewList = !this.isViewList;
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
