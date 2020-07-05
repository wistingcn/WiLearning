import { Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import { I18nService } from 'src/app/service/i18n.service';
import { LoggerService } from 'src/app/service/logger.service';
import { PdfService } from 'src/app/service/pdf.service';
import { EventbusService, IEventType, EventType } from 'src/app/service/eventbus.service';
import { ProfileService } from 'src/app/service/profile.service';
import { ClahttpService } from 'src/app/service/clahttp.service';
import { DocImagesUrl } from '../../config';

@Component({
  selector: 'app-pdf-select',
  templateUrl: './pdf-select.component.html',
  styleUrls: ['./pdf-select.component.css']
})
export class PdfSelectComponent implements OnInit, AfterViewInit {
  docList;
  pdfFile: File;
  pdfNum = 0;
  pdfCurrentPage = 0;
  docSelected;

  transStart = false;
  message: string;
  @ViewChild('scrollbar', {static: false} ) scrollbar;

  constructor(
    public i18n: I18nService,
    private logger: LoggerService,
    public pdfs: PdfService,
    private eventbus: EventbusService,
    public profile: ProfileService,
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
        this.message = `${fileName} Done!`;
      } else if ( event.type === EventType.pdftranscode_progress) {
        this.pdfCurrentPage = event.data.page;
        const fileName = event.data.fileName;
        this.message = `${fileName} ${this.pdfCurrentPage}/${this.pdfNum}`;
      }
    });
  }

  ngAfterViewInit() {
    this.loadDocs();
  }

  loadDocs() {
    const docUrl = DocImagesUrl + '/' + this.profile.roomId;

    this.clahttp.http.get(docUrl).subscribe(res => {
      this.docList = res;
    }, error => {
      this.logger.error('get %s error: %s !', docUrl, error);
    });
  }

  onClose() {
    this.eventbus.overlay$.next({
      type: EventType.overlay_pdfSelectClosed
    });
  }

  async addFile(file: File) {
    if ( !file ) {
      return;
    }
    this.logger.debug('selectFile, name: %s, size: %s', file.name, file.size);

    this.transStart = true;
    this.message = `${file.name}...`;

    const url = URL.createObjectURL(file);
    await this.pdfs.openPdf(file.name, url);
    URL.revokeObjectURL(url);

    this.loadDocs();
    setTimeout(() => this.scrollbar.directiveRef.scrollToBottom(0), 500);
    this.transStart = false;
  }

  docSelect(doc) {
    this.docSelected = doc;
  }

  docOpen() {
    this.logger.debug('pdf-select, docOpen');

    this.pdfs.selectedDoc = this.docSelected;
    this.eventbus.docoment$.next({
      type: EventType.document_docSelect,
      data: {doc: this.docSelected}
    });

    this.onClose();
  }

  docImport() {
    this.pdfs.selectedDoc = this.docSelected;
    this.eventbus.docoment$.next({
      type: EventType.document_docImport,
      data: {doc: this.docSelected}
    });
  }
}
