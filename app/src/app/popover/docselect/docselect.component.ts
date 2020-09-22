import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EventbusService, EventType, IEventType } from '../../service/eventbus.service';
import { LoggerService } from '../../service/logger.service';
import { DocumentService } from '../../service/document.service';
import { ProfileService } from '../../service/profile.service';
import { WlhttpService } from '../../service/wlhttp.service';
import { DocImagesUrl } from '../../config';
import { WlDocument, getImageMeta } from '../../defines';
import { I18nService } from '../../service/i18n.service';
import {fabric} from 'fabric';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-docselect',
  templateUrl: './docselect.component.html',
  styleUrls: ['./docselect.component.scss'],
})
export class DocselectComponent implements OnInit, AfterViewInit {

  docList: WlDocument[] = [];
  pdfFile: File;
  pdfNum = 0;
  pdfCurrentPage = 0;
  docSelected: WlDocument;

  transStart = false;
  message: string;
  constructor(
    public i18n: I18nService,
    private eventbus: EventbusService,
    private logger: LoggerService,
    private ds: DocumentService,
    private profile: ProfileService,
    private http: WlhttpService,
  ) { }

  ngOnInit() {
    this.eventbus.pdftranscode$.subscribe((event: IEventType) => {
      if ( event.type ===  EventType.pdftranscode_start) {
        this.pdfNum = event.data.num;
        const fileName = event.data.fileName;
        this.message = `${fileName} 0/${this.pdfNum}`;
      } else if ( event.type === EventType.pdftranscode_end) {
        const fileName = event.data.fileName;
        this.message = `Done!`;
      } else if ( event.type === EventType.pdftranscode_progress) {
        this.pdfCurrentPage = event.data.page;
        const fileName = event.data.fileName;
        this.message = `${fileName} ${this.pdfCurrentPage}/${this.pdfNum}`;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadDocs();
    });
  }

  loadDocs() {
    this.docList = [];
    this.ds.docsMap.forEach(value => {
      this.docList.push(value);
    });

    const docUrl = DocImagesUrl + '/' + this.profile.roomId;

    this.http.http.get(docUrl).subscribe(res => {
      const docs = res as WlDocument[];
      this.logger.debug(res);

      docs.forEach(value => {
        if ( !this.docList.find(doc => doc.id === value.id)) {
          this.docList.push(value);
        }
      });

      this.docList.forEach(doc => {
        if (doc.id === this.ds.selectedDoc.id) {
          this.docSelected = doc;
        }
      });
    }, error => {
      this.logger.error('get %s error: %s !', docUrl, error);
    });
  }

  close() {
    this.eventbus.popover$.next({
      type: EventType.popover_docSelectClosed
    });
  }

  async addFile(ev) {
    const file = ev.target.files[0] as File;
    if ( !file ) {
      return;
    }
    this.logger.debug('selectFile, name: %s, size: %s', file.name, file.size);

    this.transStart = true;
    this.message = `${file.name}...`;

    const url = URL.createObjectURL(file);
    await this.ds.openPdf(file.name, url);
    URL.revokeObjectURL(url);

    this.loadDocs();
    this.transStart = false;
  }

  docSelect(doc: WlDocument) {
    this.docSelected = doc;
  }

  docOpen() {
    this.logger.debug('pdf-select, docOpen');

    this.eventbus.document$.next({
      type: EventType.document_docSelect,
      data: {doc: this.docSelected}
    });

    this.close();
  }

  async docExport() {
    const docOpened = this.ds.docFindOpened(this.docSelected);
    if (!docOpened) {
      return;
    }

    const canvas = document.createElement('canvas');
    const archor = document.createElement('a');
    const fabCanvas = new fabric.Canvas(canvas);
    const pdfdoc = new jsPDF();

    let pageNum = 1;
    do {
      fabCanvas.clear();

      const serial = docOpened.getSerialMap(pageNum);
      if (serial) {
        const serialObj = JSON.parse(serial);

        let image = null;
        if (serialObj.fabric.backgroundImage && serialObj.fabric.backgroundImage.src) {
          const src = serialObj.fabric.backgroundImage.src;
          image = await new Promise(resolve => fabric.Image.fromURL(src, resolve, {crossOrigin: 'anonymous'})) as fabric.Image;
          delete serialObj.fabric.backgroundImage;
        }

        console.log('serial data: %s', JSON.stringify(serialObj));

        await new Promise(resolve => fabCanvas.loadFromJSON(serialObj.fabric, resolve));
        if (image) {
          await new Promise(resolve => fabCanvas.setBackgroundImage(image, resolve));
        }
        fabCanvas.setHeight(serialObj.canvas.height).setWidth(serialObj.canvas.width);
      } else {
        const path = docOpened.getPagePath(pageNum);
        if (path) {
          const image = await getImageMeta(path);
          fabCanvas.setWidth(image.width).setHeight(image.height);
          await new Promise(resolve => fabCanvas.setBackgroundImage(path, resolve, {crossOrigin: 'anonymous'}));
        }
      }

      fabCanvas.renderAll();
      const img = fabCanvas.toDataURL({
        format: 'png',
        width: fabCanvas.width,
        height: fabCanvas.height,
      });

      this.logger.debug(`canvas : ${fabCanvas.width} * ${fabCanvas.height}, pdf: ${pdfdoc.internal.pageSize.getWidth()} * ${pdfdoc.internal.pageSize.getHeight()}`);
      const height = fabCanvas.height / fabCanvas.width  * pdfdoc.internal.pageSize.getWidth();

      pdfdoc.addImage({
        imageData: img,
        x: 0,
        y: 0,
        width: pdfdoc.internal.pageSize.getWidth(),
        height,
      });

      this.message = `${this.i18n.lang.export} ${pageNum}/${docOpened.numPages}`;
      pageNum++;
      if (pageNum > docOpened.numPages) {
        this.logger.debug(`finish export: ${docOpened.fileName}`);
        this.message = '';
        const filename = docOpened.fileName.slice(0, docOpened.fileName.lastIndexOf('.')) + '-' + Date.now() + '.pdf';
        pdfdoc.save(filename);
        break;
      } else {
        pdfdoc.addPage();
      }
    } while (true);
  }
}
