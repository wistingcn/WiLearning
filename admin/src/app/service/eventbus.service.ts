import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface IEventType {
  type: string|number;
  data?: any;
  error?: string;
}

export enum EventType {
  room_created = 1,
}

@Injectable({
  providedIn: 'root'
})
export class EventbusService {
  public room$ = new Subject();

  constructor() { }
}
