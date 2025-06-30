import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, Observable, retry, Subscription, take, throwError, timer } from "rxjs";

import { Router } from "@angular/router";
import { AuthService } from "../helpers/auth/Auth/auth.service";
@Injectable({
  providedIn: 'root',
})

export class SharedService {
  public Token: any;
  loginCard!: boolean;
  timeoutHandle: any = null;
  public value!: number;
  timeLimit: any;
  redirectSection: boolean = false;
  constructor(private http: HttpClient, private cookieService: CookieService, private authService: AuthService, private router: Router) { }
  getToken() {
    this.authService.isloggedToken.subscribe((event: any) => {
      if (event !== undefined && event !== '' && event != null) {
        this.Token = event;
      } else {
        this.Token = sessionStorage.getItem('UserToken');
      }
    });
    return this.Token;
  }
  setLoginPage() {
    this.loginCard = true;
    let usertemp: any = sessionStorage.getItem('UserDetails');
    let userDetails = JSON.parse(usertemp);
    if (userDetails) {
      return { "LoginId": userDetails?.Result?.LoginId }
    }
    else return null;
  }
  onPostMethodBearerSync(UrlLink: string, ReqObj: any): Observable<any[]> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Bearer ' + this.getToken());
    return this.http
      .post<any>(UrlLink, ReqObj, { headers: headers })
      .pipe(retry(1), catchError(this.handleError));
  }
  onPostMethodSync(UrlLink: string, ReqObj: any): Observable<any> {

    this.cookieService.set("XSRF-TOKEN", this.getToken(), 1, '/', 'localhost', false, "Strict");
    let headers = new HttpHeaders();
    headers = headers.append('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0');
    headers = headers.append('Pragma', 'no-cache');
    headers = headers.append('Expires', '0');
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.getToken());
    headers = headers.append("X-XSRF-TOKEN", this.getToken());
    return this.http
      .post<any>(UrlLink, ReqObj, { headers: headers })
      .pipe(catchError(this.handleError));
  }
  onGetMethodSync(UrlLink: string): Observable<any[]> {
    this.cookieService.set("XSRF-TOKEN", this.getToken(), 1, '/', 'localhost', false, "Strict");
    let headers = new HttpHeaders();
    headers = headers.append('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0');
    headers = headers.append('Pragma', 'no-cache');
    headers = headers.append('Expires', '0');
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.getToken());
    headers = headers.append("X-XSRF-TOKEN", this.getToken());
    return this.http
      .get<any>(UrlLink, { headers: headers })
      .pipe(catchError(this.handleError));
  }
  onPostDocumentMethodSync(UrlLink: string, ReqObj: any, file: File): Observable<any[]> {
    const formData: FormData = new FormData();
    formData.append('File', file);
    formData.append('Req ', JSON.stringify(ReqObj));
    this.cookieService.set("XSRF-TOKEN", this.getToken(), 1, '/', 'localhost', false, "Strict");
    let headers = new HttpHeaders();
    headers = headers.append('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0');
    headers = headers.append('Pragma', 'no-cache');
    headers = headers.append('Expires', '0');
    headers = headers.append('Authorization', 'Bearer ' + this.getToken());
    headers = headers.append("X-XSRF-TOKEN", this.getToken());
    return this.http
      .post<any>(UrlLink, formData, { headers: headers })
      .pipe(catchError(this.handleError));
  }
  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }
  async onPostMethodUnAuthAsync(UrlLink: any, ReqObj: any): Promise<Observable<any[]>> {
    let headers = new HttpHeaders();
    return await this.http
      .post<any>(UrlLink, ReqObj, { headers: headers })
      .pipe(retry(1), catchError(this.handleError));
  }
  clearTimeOut() {
    console.log('Clear Time Out');
    const redirectStatus = sessionStorage.getItem('redirectStatus');
    console.log('Router url', this.router.url);
    // tslint:disable-next-line: triple-equals
    if ((redirectStatus == undefined && this.router != undefined)) {
      // tslint:disable-next-line: triple-equals
      console.log('Clear Time Out1');
      if (this.router.url != '/' && this.router.url != '/Login/Home' && this.router.url != '/Login/sessionRedirect' && this.router.url != '/Login/Officer' && this.router.url != '/Login/Assessor' && this.router.url != '/Login/Garage') {
        window.clearTimeout(this.timeoutHandle);
        console.log('Clear Time Out2');
        this.setTimeOutSection();
      }
    }
    return true;
  }
  setTimeOutSection() {
    this.timeoutHandle = setTimeout(() => this.showAlert(this.redirectSection, this.router), (5 * 60 * 1000));
    //(30 * 1000)
    //this.redirectRouting();
  }
  showAlert(redirectSection: any, router: any) {
    const redirectStatus = sessionStorage.getItem('redirectStatus');
    // tslint:disable-next-line: triple-equals
    if ((redirectStatus == undefined && router != undefined)) {
      // tslint:disable-next-line: triple-equals
      if (this.router.url != '/' && this.router.url != '/Login/Home' && this.router.url != '/Login/sessionRedirect' && this.router.url != '/Login/Officer' && this.router.url != '/Login/Assessor' && this.router.url != '/Login/Garage') {

        sessionStorage.setItem('redirectStatus', 'started');

        const startValue: any = 1 * 60 + 5;

        this.timeLimit = timer(0, 1000).pipe(
          take(startValue + 1),
          map((value: any) => startValue - value),
        ).subscribe(
          value => this.value = value,
          null,
          () => this.timeLimit = null,
        );
        console.log('Alert Time Out', router, this.redirectSection, this.timeLimit);
        // alert('User Ti');
        // Swal.fire({
        //   title: '<strong> Time Out</strong>',
        //   icon: 'info',
        //   html:
        //     `<ul class="list-group errorlist">
        //      <li>Do You Want to Still Proceed?</li>
        //  </ul>`,
        //   showCloseButton: false,
        //   //focusConfirm: false,
        //   showCancelButton:true,

        //  //confirmButtonColor: '#3085d6',
        //  cancelButtonColor: '#d33',
        //  confirmButtonText: 'YES',
        //  cancelButtonText: 'NO',
        // }).then((result) => {
        //   if (result.isConfirmed) {
        //         this.onProceed('Yes')
        //   }
        //   else if(result.isDismissed){
        //     this.onProceed('No')
        //   }
        //   else {
        //     this.redirectRouting();
        //   }
        // })

      }
    }
  }
}