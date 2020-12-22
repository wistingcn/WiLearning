/*
 * Copyright (c) 2020 liwei<linewei@gmail.com>
 *
 * This program is free software: you can use, redistribute, and/or modify
 * it under the terms of the GNU Affero General Public License, version 3
 * or later ("AGPL"), as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { map, last, catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { WlFile } from '../defines';

@Injectable({
  providedIn: 'root'
})
export class WlhttpService {

  constructor(
    private logger: LoggerService,
    public http: HttpClient,
  ) { }

  uploadFiles(file: WlFile, url: string) {
    const headers = new HttpHeaders();
    headers.set('Access-Control-Allow-Origin', '*');

    const form = new FormData();
    form.append('file', file.blob, file.name);

    const req = new HttpRequest('POST', url, form, {
      reportProgress: true,
      headers,
    });

    return this.http.request(req).pipe(
      map(event => this.getEventMessage(event, file)),
      last(),
      catchError(this.handleError(file))
    );
  }

  private getEventMessage(event: HttpEvent<any>, file: WlFile) {
    let message = '';
    switch (event.type) {
      case HttpEventType.Sent:
        message = `Uploading file "${file.name}" of size ${file.size}.`;
        break;

      case HttpEventType.UploadProgress:
        // Compute and show the % done:
        const percentDone = Math.round(100 * event.loaded / event.total);
        message = `File "${file.name}" is ${percentDone}% uploaded.`;
        break;

      case HttpEventType.Response:
        message = `File "${file.name}" was completely uploaded!`;
        break;

      default:
        message = `File "${file.name}" surprising upload event: ${event.type}.`;
    }

    this.logger.debug(message);
    return event;
  }

  private handleError(file: WlFile) {
    return (error: HttpErrorResponse)  => {
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        this.logger.error('%s: An error occurred: %s', file.name, error.error.message);
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        this.logger.error(
          `${file.name}: ` +
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }
      // return an observable with a user-facing error message
      return throwError(
        'Something bad happened; please try again later.');
    };
  }
}
