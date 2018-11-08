import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JwtService } from './shared/services/jwt.service';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(private jwtService: JwtService) {}
  headersConfig = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(req.url);
    let urlArr= req.url.split('/');
    console.log(urlArr[urlArr.length-1]);
    let request = null;
    

    const token = this.jwtService.getToken();
    if (token) {
      this.headersConfig['Authorization'] = `Bearer ${token}`;
    }

    if(urlArr[urlArr.length-1] !=='upload'){
      console.log("change the headersConfig");
      request = req.clone({ setHeaders: this.headersConfig });
    }else{
      request = req;
    }
    
    return next.handle(request);
  }
}