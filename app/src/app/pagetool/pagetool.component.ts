import { Component, OnInit } from '@angular/core';
import { DrawtoolService, DrawtoolType } from '../service/drawtool.service';
import { LoggerService } from '../service/logger.service';
import { DocumentService } from '../service/document.service';
import { ProfileService } from '../service/profile.service';

@Component({
  selector: 'app-pagetool',
  templateUrl: './pagetool.component.html',
  styleUrls: ['./pagetool.component.scss'],
})
export class PagetoolComponent implements OnInit {

  constructor(
    public drawtool: DrawtoolService,
    public dc: DocumentService,
    public profile: ProfileService,
    private logger: LoggerService,
  ) { }

  ngOnInit() {}

  zoomOut() {
    const zoom = this.dc.selectedDoc.zoom + 0.05;
    this.dc.selectedDoc.setZoom(zoom);
  }

  zoomIn() {
    const zoom = this.dc.selectedDoc.zoom - 0.05;
    if (zoom < 0.05) {
      return;
    }
    this.dc.selectedDoc.setZoom(zoom);
  }

  async nextPage() {
    await this.dc.selectedDoc.nextPage();
    this.drawtool.setupTool();
  }

  async prevPage() {
    await this.dc.selectedDoc.prevPage();
    this.drawtool.setupTool();
  }
}
