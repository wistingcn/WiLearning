import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DocumentService, WlDocPages } from '../service/document.service';
import { LoggerService } from '../service/logger.service';
import {fabric} from 'fabric';
import { getImageMeta } from '../defines';
import { EventbusService, IEventType, EventType } from '../service/eventbus.service';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements OnInit, AfterViewInit {

  fabCanvas: fabric.Canvas;
  image: fabric.Image;
  @Input() page: WlDocPages;
  @ViewChild('canvas', {static: false}) canvas: ElementRef;

  width = 200;

  constructor(
    private ds: DocumentService,
    private logger: LoggerService,
    private eventbus: EventbusService,
  ) { }

  ngOnInit() {
    this.eventbus.draw$.subscribe((event: IEventType) => {
      if (event.type === EventType.draw_action && event.data === this.page.page ) {
        this.renderSerial(event.data);
      }
    });
  }

  ngAfterViewInit() {
    this.fabCanvas = new fabric.Canvas(this.canvas.nativeElement);
    this.goPage(this.page.page);
  }

  async renderSerial(pageNum: number) {
    const serial = this.getSerialMap(pageNum);
    if ( ! serial ) {
      return false;
    }

    console.log('serial data: %s', serial);
    const serialObj = JSON.parse(serial);

    if ( !this.image) {
      const src = serialObj.fabric.backgroundImage.src;
      this.image = await new Promise(resolve => fabric.Image.fromURL(src, resolve));
    }

    delete serialObj.fabric.backgroundImage;
    console.log('serial data: %s', JSON.stringify(serialObj));

    this.fabCanvas.setWidth(this.width).setHeight(this.width / serialObj.canvas.width * serialObj.canvas.height);
    await new Promise(resolve => this.fabCanvas.loadFromJSON(serialObj.fabric, resolve));
    await new Promise(resolve => this.fabCanvas.setBackgroundImage(this.image, resolve));
    this.fabCanvas.forEachObject((element) => element.selectable = false );
    this.fabCanvas.renderAll();
    this.fabCanvas.setZoom(this.width / serialObj.canvas.width);
    return true;
  }

  async renderPage(pageNum: number) {
    const path = this.ds.selectedDoc.getPagePath(pageNum);
    if (path) {
      const image = await getImageMeta(path);
      await this.renderImageUrl(this.width, this.width / image.width * image.height, path);
      this.fabCanvas.setZoom(this.width / image.width);
    }
  }

   public getSerialMap(pageNum: number) {
      return this.ds.selectedDoc.serialMap.get(pageNum);
   }

  async renderImageUrl(width, height, url) {
    this.logger.debug('render Image, width: %s, height: %s, url: %s', width, height, url);

    if ( !this.image) {
      this.image = await new Promise(resolve => fabric.Image.fromURL(url, resolve));
    }

    this.fabCanvas.setWidth(width).setHeight(height);
    return new Promise(resolve => this.fabCanvas.setBackgroundImage(this.image, () => {
      this.fabCanvas.renderAll.bind(this.fabCanvas, {
        width,
        height,
        originX: 'left',
        originY: 'top'
      })();
      resolve();
    }));
  }

  async goPage(pageNum) {
    this.fabCanvas.clear();
    if ( ! await this.renderSerial(pageNum) ) {
      await this.renderPage(pageNum);
    }
  }
}
