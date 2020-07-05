import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class DrawtoolService {
  color = 'black';
  lineWeight = 1;
  shape: string;
  fontSize: 50;
  fontFamily: 'Arial';
  public fabCanvas: fabric.Canvas;
  private lining: fabric.Line;
  private recting: fabric.Rect;
  private texting: fabric.IText;
  public document;

  // 'none|free'|'select'|'text'|'rect'|'line';
  public selectedTool: string;

  constructor(
    private logger: LoggerService,
  ) { }

  setDocument(doc) {
    this.fabCanvas = doc.fabCanvas;
    this.document = doc;
    if ( !doc.isCanvasInited ) {
      this.setupEvent();
      doc.isCanvasInited = true;
    }
    this.setupTool();
  }

  private setupTool() {
    switch (this.selectedTool) {
      case 'text' :
        this.setDrawText();
        break;
      case 'rect' :
        this.setDrawRect();
        break;
      case 'line' :
        this.setDrawLine();
        break;
      case 'select' :
        this.setDrawSelect();
        break;
      case 'free' :
        this.setDrawFree();
        break;
      default :
        break;
    }

    this.setColor(this.color);
    this.setLineWeight(this.lineWeight);
  }

  private setupEvent() {
    document.addEventListener('keydown', (e) => {
      if ( e.key === 'Escape') {
        this.setDrawSelect();
      }

      if ( e.key === 'Backspace' || e.key === 'Delete' ) {
        this.delObject();
      }
    });

    this.fabCanvas.on('mouse:down', (e) => {
      switch (this.selectedTool) {
        case 'text' :
          return this.enterDrawText(e);
        case 'rect' :
          return this.enterDrawRect(e);
        case 'line' :
          return this.enterDrawLine(e);
      }
    });

    this.fabCanvas.on('mouse:move', (e) => {
      if ( e.target ) {
        if (this.selectedTool !== 'select' ) {
          e.target.hoverCursor = this.fabCanvas.defaultCursor;
        } else {
          e.target.hoverCursor = this.fabCanvas.hoverCursor;
        }
      }
      switch (this.selectedTool) {
        case 'line' :
          if ( this.lining ) {
            const loc = this.fabCanvas.getPointer(e.e);
            this.lining.set('x2', loc.x);
            this.lining.set('y2', loc.y);
            this.lining.setCoords();
            this.fabCanvas.renderAll();
          }
          break;
        case 'rect' :
          if ( this.recting ) {
            const loc = this.fabCanvas.getPointer(e.e);
            const width = loc.x - this.recting.left;
            const height = loc.y - this.recting.top;

            this.recting.set({width, height});
            this.recting.setCoords();
            this.fabCanvas.renderAll();
          }
          break;
      }
    });

    this.fabCanvas.on('mouse:up', (e) => {
      switch (this.selectedTool) {
        case 'line' :
          if ( this.lining ) {
            this.lining = undefined;
            this.fabCanvas.discardActiveObject();
            this.document.sendSyncDocInfo();
          }
          break;
        case 'rect' :
          this.recting = undefined;
          this.document.sendSyncDocInfo();
          break;
        case 'free' :
          this.document.sendSyncDocInfo();
          break;
      }
    });

    this.fabCanvas.on('mouse:dblclick', (e) => {
      this.setDrawText();
      this.enterDrawText(e);
    });

    this.fabCanvas.on('object:removed', (e) => {
      this.logger.debug('fabric canvas %s is removed', e.target);
      this.document.sendSyncDocInfo();
    });

    this.fabCanvas.on('object:modified', (e) => {
      this.logger.debug('fabric canvas object modified , %s', e.target);
      this.document.sendSyncDocInfo();
    });
  }

  private enterDrawText(e: fabric.IEvent) {
    if (e.target && e.target.type === 'i-text') {
      return;
    }

    const loc = this.fabCanvas.getPointer(e.e);
    this.logger.debug('Draw text, e: %o, x: %s, y: %s', e, loc.x, loc.y);

    this.texting = new fabric.IText('', {
      left: loc.x,
      top: loc.y,
    });

    this.texting .setColor(this.color);

    this.fabCanvas.add(this.texting);
    this.fabCanvas.setActiveObject(this.texting);
    this.texting.enterEditing();

    this.texting.on('editing:exited', () => {
      if ( !this.texting.text.length ) {
        this.fabCanvas.remove(this.texting);
      }
    });
  }

  private enterDrawRect(e: fabric.IEvent) {
    const loc = this.fabCanvas.getPointer(e.e);
    this.logger.debug('Draw Rect, x: %s, y: %s', loc.x, loc.y);
    this.recting = new fabric.Rect({
      left: loc.x,
      top: loc.y,
      width: 0,
      height: 0,
      fill: '',
      selectable: false,
      stroke: this.color,
      opacity: 1,
      strokeWidth: this.lineWeight
      }
    );

    this.fabCanvas.add(this.recting);
  }

  private enterDrawLine(e: fabric.IEvent) {
    this.logger.debug('target: %o', e.target);

    const loc = this.fabCanvas.getPointer(e.e);
    this.logger.debug('Draw line, x: %s, y: %s', loc.x, loc.y);
    this.lining = new fabric.Line(
      [loc.x, loc.y, loc.x, loc.y],
      {
        selectable: false,
        stroke: this.color,
        strokeWidth: this.lineWeight
      }
    );

    this.fabCanvas.add(this.lining);
  }

  public recoverCanvas() {
    this.fabCanvas.isDrawingMode = false;
    this.selectedTool = 'none';

    this.fabCanvas.getObjects().forEach(obj => obj.selectable = false);
  }

  setDrawRect() {
    this.recoverCanvas();
    this.selectedTool = 'rect';
  }

  setDrawLine() {
    this.recoverCanvas();
    this.selectedTool = 'line';
  }

  setDrawText() {
    this.recoverCanvas();
    this.selectedTool = 'text';
  }

  setDrawFree() {
    this.recoverCanvas();
    this.fabCanvas.isDrawingMode = true;
    this.selectedTool = 'free';

    this.updataCanvasTool();
  }

  setDrawSelect() {
    this.fabCanvas.isDrawingMode = false;
    this.selectedTool = 'select';

    this.fabCanvas.getObjects().forEach(obj => {
      obj.selectable = true;
      if (obj.type === 'i-text') {
        const text = obj as fabric.IText;
        if ( text.isEditing ) {
          text.exitEditing();
        }
      }
    });
  }

  delObject() {
    if ( this.selectedTool !== 'select' ) {
      return;
    }

    const objects = this.fabCanvas.getActiveObjects();
    objects.forEach(object => {
      this.fabCanvas.remove(object);
    });

    if ( objects.length ) {
      this.fabCanvas.renderAll();
    }
  }

  setColor(color) {
    this.color = color;
    this.updataCanvasTool();
  }

  setLineWeight(weight) {
    this.lineWeight = weight;
    this.updataCanvasTool();
  }

  private updataCanvasTool() {
    if ( this.fabCanvas.isDrawingMode ) {
      this.fabCanvas.freeDrawingBrush.color = this.color;
      this.fabCanvas.freeDrawingBrush.width = this.lineWeight;
    }
  }
}
