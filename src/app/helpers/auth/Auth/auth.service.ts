import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
@Injectable()
export class AuthService {


  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private loggedToken: BehaviorSubject<any> = new BehaviorSubject<any>('');

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  get isloggedToken() {
    return this.loggedToken.asObservable();
  }
  refreshMenu(){
            
  }
  constructor(
    private router: Router,
    private http: HttpClient,
    private injector: Injector,
    @Inject(DOCUMENT) private _document: Document,
  ) {

  }

  login(userDetails: any) {
    if (userDetails.Result && userDetails.Result.Token != null) {
      this.loggedIn.next(true);
    }
  }

  UserToken(newUserToken: any) {
    this.loggedToken.next(newUserToken);
  }

  logout() {
    this.loggedIn.next(false);
  }

}
