import { Component, OnInit } from '@angular/core';
import { DrawtoolService } from '../service/drawtool.service';
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
    const zoom = this.dc.selectedDoc.zoom + 0.1;
    this.dc.selectedDoc.setZoom(zoom);
  }

  zoomIn() {
    const zoom = this.dc.selectedDoc.zoom - 0.1;
    if (zoom < 0.1) {
      return;
    }
    this.dc.selectedDoc.setZoom(zoom);
  }

}
