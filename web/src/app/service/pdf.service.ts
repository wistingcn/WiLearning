import { Injectable } from '@angular/core';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { LoggerService } from './logger.service';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ClaFile } from '../defines';
import { DocImagesUrl } from '../config';
import { ClahttpService } from './clahttp.service';
import { ProfileService } from './profile.service';

export interface IImageData {
  height: number;
  width: number;
  image: string;
}

export class ClaDocPages {
  id: string;
  page: number;
  path: string;
}

export class ClaDocs {
  public numPages: number;
  public id: number;
  public serialMap = new Map<number, string>();
  public pages;
  public uploadTime: string;

  constructor(
    public fileName: string,
    ) {
  }

   public setSerialMap(pageNum: number, serialData: string) {
       this.serialMap.set(pageNum, serialData);
   }

   public getSerialMap(pageNum: number) {
      return this.serialMap.get(pageNum);
  }
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  public docsMap = new Map<string, ClaDocs>();
  public selectedDoc;

  constructor(
    private logger: LoggerService,
    private eventbus: EventbusService,
    private claHttp: ClahttpService,
    private profile: ProfileService,
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

    await page.render({ canvasContext: context, viewport });
    const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve));

    const pageName = fileName + '-' + pageNum.toString();
    const file = new ClaFile(pageName, blob.size, blob);

    return this.claHttp
      .uploadFiles(file, DocImagesUrl + '/' + this.profile.roomId)
      .toPromise();
  }

}
