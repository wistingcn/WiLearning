import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EventbusService, EventType, IEventType } from '../../service/eventbus.service';
import { LoggerService } from '../../service/logger.service';
import { DocumentService } from '../../service/document.service';
import { ProfileService } from '../../service/profile.service';
import { ClahttpService } from '../../service/clahttp.service';
import { DocImagesUrl } from '../../config';
import { WlDocument } from '../../defines';

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
    private eventbus: EventbusService,
    private logger: LoggerService,
    private ds: DocumentService,
    private profile: ProfileService,
    private clahttp: ClahttpService,
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
    this.ds.docsMap.forEach(value => {
      this.docList.push(value);
    });

    const docUrl = DocImagesUrl + '/' + this.profile.roomId;

    this.clahttp.http.get(docUrl).subscribe(res => {
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
}
