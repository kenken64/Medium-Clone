import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  private formatErrors<T>(error: any) {
    return (error: any): Observable<T> => {
      console.log(">>>> " + JSON.stringify(error));
      if(error.status != 401){
        this.showErrorMessage(JSON.stringify(error.error));
      }
      return throwError(error || 'generic backend error');
    }
  }

  showErrorMessage(msg) {
    let snackBarRef = this.snackBar.open(msg, 'Undo', {
      duration: 3000 } );
    console.log(snackBarRef);
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.api_url}${path}`, { params })
      .pipe(catchError(this.formatErrors<any>(`${environment.api_url}${path}`)));
  }

  put(path: string, body: Object = {}): Observable<any> {
    console.log(body);
    return this.http.put(
      `${environment.api_url}${path}`,
      body
    ).pipe(catchError(this.formatErrors<any>(`${environment.api_url}${path}`)));
  }

  post(path: string, body: Object = {}): Observable<any> {
    console.log("path>" + path);
    return this.http.post(
      `${environment.api_url}${path}`,
      body
    ).pipe(catchError(this.formatErrors<any>(`${environment.api_url}${path}`)));
  }

  delete(path): Observable<any> {
    return this.http.delete(
      `${environment.api_url}${path}`
    ).pipe(catchError(this.formatErrors<any>(`${environment.api_url}${path}`)));
  }
}