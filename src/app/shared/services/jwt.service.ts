import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class JwtService {
  constructor(){
    
  }
  
  getToken(): String {
    return window.localStorage['jwtToken'];
  }

  saveToken(token: String) {
    console.log("JWT > " + token);
    window.localStorage['jwtToken'] = token;
  }

  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }

}