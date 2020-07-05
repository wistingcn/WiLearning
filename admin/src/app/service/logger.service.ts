import { Injectable } from '@angular/core';
import debug from 'debug';

const APP_NAME = 'wimeeting-admin';
localStorage.debug = 'wimeeting-admin:*';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private pDebug: any;
  private pWarn: any;
  private pError: any;

  constructor(
  ) {
    this.pDebug = debug(`${APP_NAME}:DEBUG`);
    this.pWarn = debug(`${APP_NAME}:WARN`);
    this.pError = debug(`${APP_NAME}:ERROR`);

    // tslint:disable-next-line: no-console
    this.pDebug.log = console.info.bind(console);
    this.pWarn.log = console.warn.bind(console);
    this.pError.log = console.error.bind(console);
  }

  get debug() {
    return this.pDebug;
  }

  get warn() {
    return this.pWarn;
  }

  get error() {
    return this.pError;
  }
}
