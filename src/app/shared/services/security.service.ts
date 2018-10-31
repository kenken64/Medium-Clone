import { Injectable } from '@angular/core';
import { BehaviorSubject ,  ReplaySubject } from 'rxjs';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models/user';
import { map ,  distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private API:string = `/api`
  private registerRootApiUrl = `${this.API}/register`;
  private loginRootApiUrl = `${this.API}/login`;
  private resetPasswordRootApiUrl = `${this.API}/resetPassword`;
  private isResetIdOkRootApiUrl = `${this.API}/isResetIdOk`;
  private changePasswordRootApiUrl = `${this.API}/changePassword`;
  private changePasswordResetIdRootApiUrl = `${this.API}/resetChangePassword`;

  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor( private http: ApiService,
    private jwtService: JwtService) { }

  register(user){
    console.log("Register srvice !")
    return this.http.post(this.registerRootApiUrl, user);
  }

  setAuth(user: User) {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  login(user){
    return this.http.post(this.loginRootApiUrl, user)
      .pipe(map(
      data => {
        console.log("login ...")
        this.setAuth(data.user);
        return data;
      }
    ));
  }

  changePassword(user){
    return this.http.post(this.changePasswordRootApiUrl, user);
  }

  changePasswordWithResetId(user){
    console.log("changePasswordWithResetId" + user);
    console.log(this.changePasswordResetIdRootApiUrl);
    return this.http.post(this.changePasswordResetIdRootApiUrl, user);
  }

  resetPassword(email){
    console.log(email);
    return this.http.post(this.resetPasswordRootApiUrl, email);
  }

  isResetIdValid(resetId){
    return this.http.get(`${this.isResetIdOkRootApiUrl}/${resetId}`);
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  logout() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }
}
