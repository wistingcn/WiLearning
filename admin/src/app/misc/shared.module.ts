import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutModule } from '@angular/cdk/layout';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialComponentsModule } from './material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    LayoutModule,
    OverlayModule,
    PortalModule,
    DragDropModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialComponentsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    LayoutModule,
    OverlayModule,
    PortalModule,
    DragDropModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialComponentsModule
  ]
})
export class SharedModule {}
