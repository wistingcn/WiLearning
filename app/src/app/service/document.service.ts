/*
 * Copyright (c) 2020 liwei<linewei@gmail.com>
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
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { LoggerService } from './logger.service';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { WlFile, WlDocument, getImageMeta } from '../defines';
import { DocImagesUrl } from '../config';
import { WlhttpService } from './wlhttp.service';
import { ProfileService } from './profile.service';
import { SignalingService } from './signaling.service';
import {fabric} from 'fabric';

export interface IImageData {
  height: number;
  width: number;
  image: string;
}

export class WlDocPages {
  id: string;
  page: number;
  path: string;
}

export class WlDocs extends WlDocument {
  public numPages: number;
  public id: number;
  public serialMap = new Map<number, string>();
  public pages: WlDocPages[] = [];
  public uploadTime: string;
  public fabCanvas: fabric.Canvas = null;
  public url: URL;
  public pageNum = 1;
  public disable = false;
  public signaling: SignalingService = null;
  public eventbus: EventbusService = null;
  public zoom = 1;
  public docList = false;

  public type: 'file'|'whiteboard' = null;

  constructor( public fileName: string) {
      super(fileName);
  }

   public setSerialMap(pageNum: number, serialData: string) {
       this.serialMap.set(pageNum, serialData);
   }

   public getSerialMap(pageNum: number) {
      return this.serialMap.get(pageNum);
   }

   public setFabCanvas(fab: fabric.Canvas) {
     this.fabCanvas = fab;
   }

  async renderImageUrl(width, height, url) {
    // tslint:disable-next-line: no-console
    console.log('render Image, width: %s, height: %s, url: %s', width, height, url);

    this.fabCanvas.clear();
    this.fabCanvas.setWidth(width).setHeight(height);

    return new Promise(resolve => this.fabCanvas.setBackgroundImage(url, () => {
      this.fabCanvas.renderAll.bind(this.fabCanvas, {
        width,
        height,
        originX: 'left',
        originY: 'top'
      })();
      resolve();
    }));
  }

  async renderSerial(pageNum: number) {
    const serial = this.getSerialMap(pageNum);
    if ( ! serial ) {
      return false;
    }

    console.log('serial data: %s', serial);
    const serialObj = JSON.parse(serial);

    this.fabCanvas.setHeight(serialObj.canvas.height).setWidth(serialObj.canvas.width);
    await new Promise(resolve => this.fabCanvas.loadFromJSON(serialObj.fabric, resolve));
    return true;
  }

  async renderPage(pageNum: number) {
    const path = this.getPagePath(pageNum);
    if (path) {
      const image = await getImageMeta(path);
      await this.renderImageUrl(image.width, image.height, path);
    }
  }

  getPagePath(pageNum: number) {
    const page = this.pages.find(ele => ele.page === pageNum);
    if ( !page ) {
      console.error('Do not find page, file: %s, pageNum: %s', this.fileName, pageNum);
      return null;
    }
    return this.url.origin + '/' + page.path;
  }

  async nextPage() {
    if (this.pageNum >= this.numPages) {
      return;
    }

    if (this.disable ) {
      return;
    }

    this.serialPage();
    await this.goPage(this.pageNum + 1);
  }

  async prevPage() {
    if (this.pageNum <= 1) {
      return;
    }

    if (this.disable ) {
      return;
    }

    this.serialPage();
    await this.goPage(this.pageNum - 1);
  }

  async goPage(pageNum) {
    if (this.disable ) {
      return;
    }

    this.disable = true;
    this.pageNum = pageNum;

    this.fabCanvas.clear();
    if ( ! await this.renderSerial(pageNum) ) {
      await this.renderPage(pageNum);
    }

    await this.sendSyncDocInfo();
    this.disable = false;
  }

  selectPage(pageNum) {
    console.log('selectPage: %s', pageNum);
    this.serialPage();
    this.pageNum = pageNum;
    this.goPage(pageNum);
  }

  serialPage() {
    this.setSerialMap(this.pageNum, JSON.stringify(this.getSerialInfo()));
  }

  getSerialInfo() {
    return {
      doc: {
        fileName: this.fileName,
        pageNum: this.pageNum,
        numPages: this.numPages
      },
      canvas: {
        width: this.fabCanvas.getWidth(),
        height: this.fabCanvas.getHeight()
      },
      fabric: this.fabCanvas,
    };
  }

  async sendSyncDocInfo() {
    this.serialPage();

    const seri = this.getSerialInfo();
    console.log('speaker syncDocInfo : %s', JSON.stringify(seri));

    this.eventbus.draw$.next({
      type: EventType.draw_action,
      data: this.pageNum,
    });

    await this.signaling.sendSyncDocInfo(seri);
  }

  setZoom(zoom) {
    // this.fabCanvas.setZoom(zoom);
    const point = new fabric.Point(this.fabCanvas.width / 2, this.fabCanvas.height / 2);
    this.fabCanvas.zoomToPoint(point, zoom);
    this.zoom = zoom;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  public docsMap = new Map<string, WlDocs>();
  public selectedDoc: WlDocs = null;
  public lastDocSyncData = null;

  constructor(
    private logger: LoggerService,
    private eventbus: EventbusService,
    private http: WlhttpService,
    private profile: ProfileService,
    private signaling: SignalingService,
  ) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }

  async openPdf(fileName: string, src: string ) {
    const loadingTask = pdfjs.getDocument(src);
    const pdf = await loadingTask.promise;

    const num = pdf.numPages;

    this.eventbus.pdftranscode$.next({
      type: EventType.pdftranscode_start,
      data: {fileName, num},
    });

    for ( let i = 1; i <= num ; i++) {
      await this.pdfTrans(fileName, pdf, i);

      const ievent = {
        type: EventType.pdftranscode_progress,
        data: { num, fileName, page: i}
      };
      this.eventbus.pdftranscode$.next(ievent);

      this.logger.debug('pdftranscode %s, %s/%s.', fileName, i, num);
    }

    this.eventbus.pdftranscode$.next({
      type: EventType.pdftranscode_end,
      data: {fileName, num},
    });
  }

  private async pdfTrans(fileName, pdf: pdfjs.PDFDocumentProxy, pageNum: number) {

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({scale: 1.0});

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve));

    const pageName = fileName + '-' + pageNum.toString();
    const file = new WlFile(pageName, blob.size, blob);

    return this.http
      .uploadFiles(file, DocImagesUrl + '/' + this.profile.roomId)
      .toPromise();
  }

  docFindOpened(doc: WlDocument): WlDocs | null {
    let docInfo: WlDocs = null;
    this.docsMap.forEach((value, key) => {
      if (value.id === doc.id) {
        docInfo = value;
      }
    });

    return docInfo;
  }

  async docSelect(doc: WlDocument) {
    let docInfo = this.docFindOpened(doc);
    if (docInfo) {
      this.logger.debug('found docInfo: ', docInfo);
      this.selectedDoc = docInfo;
      return docInfo;
    }

    const docUrl = new URL(DocImagesUrl + '/' + this.profile.roomId + '/' + doc.id, window.location.origin);
    const selectedPages = await this.http.http.get(docUrl.href).toPromise() as WlDocPages[];
    this.logger.debug('docSelect pages %s', JSON.stringify(selectedPages));

    docInfo = new WlDocs(doc.fileName);
    docInfo.id = doc.id;
    docInfo.uploadTime = doc.uploadTime;
    docInfo.numPages = selectedPages.length;
    docInfo.pages = selectedPages;
    docInfo.url = docUrl;
    docInfo.signaling = this.signaling;
    docInfo.type = 'file';
    docInfo.opened = true;
    docInfo.eventbus = this.eventbus;
    this.docsMap.set(doc.fileName, docInfo);

    this.selectedDoc = docInfo;
    return docInfo;
  }

  newWhiteboard(fabCanvas: fabric.Canvas) {
    let whiteboard: WlDocs = null;
    this.docsMap.forEach((value, key) => {
      if (value.type === 'whiteboard') {
        whiteboard = value;
      }
    });

    if (whiteboard) {
      whiteboard.numPages++;
      const page = new WlDocPages();
      page.page = 2;
      whiteboard.pages.push(page);
    } else {
      const filename = '白板';
      whiteboard = new WlDocs(filename);
      whiteboard.uploadTime = Date.now().toString();
      whiteboard.numPages = 1;
      whiteboard.id = 0xfff;
      whiteboard.signaling = this.signaling;
      whiteboard.type = 'whiteboard';
      whiteboard.opened = true;
      whiteboard.fabCanvas = fabCanvas;
      whiteboard.eventbus = this.eventbus;

      const page = new WlDocPages();
      page.page = 1;
      whiteboard.pages.push(page);

      this.docsMap.set(filename, whiteboard);
    }


    this.selectedDoc = whiteboard;
    return whiteboard;
  }
}
