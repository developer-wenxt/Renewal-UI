// import { ErrorModalComponent } from './../shared/error/error-modal/error-modal.component';
import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as Mydatas from '../helpers/appconfig';
import { CustomLoadingService } from '../services/custom-loading.service';

import Swal from 'sweetalert2';
import { SharedService } from '../services/shareService';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  public AppConfig: any = (Mydatas as any);

  service_count = 0;
  totalRequests = 0;
  completedRequests = 0;

  constructor(
    public router: Router,
    private loader: CustomLoadingService,
    private sharedService: SharedService
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    this.loader.show();
    this.totalRequests++;
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.openResponse(event.body)
        }
        return event;
      }),
      finalize(() => {
        this.completedRequests++;
        if (this.completedRequests === this.totalRequests) {
          this.loader.hide();
          this.sharedService.clearTimeOut();
          this.completedRequests = 0;
          this.totalRequests = 0;
        }

      }),
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          const errorList: any[] = err.error.ErrorMessage;
          if (errorList.length > 0) {
            this.openError(errorList);
          }
        }
        return throwError(err.message);
      }),
    );
  }

  openResponse(res: any) {
    if (res?.ErrorMessage && res?.ErrorMessage.length > 0 || res?.Result?.ErrorMessage && res?.Result?.ErrorMessage.length > 0) {
      const errorList: any[] = res.ErrorMessage || res?.Result?.ErrorMessage;
      let ulList: any = '';
      for (let index = 0; index < errorList.length; index++) {
        const element = errorList[index];
        ulList += `<li class="list-group-item">
         <div style="color: darkgreen;">Field<span class="mx-2">:</span>${element?.Field}</div>
         <div style="color: red;">Message<span class="mx-2">:</span>${element?.Message}</div>
       </li>`

      }
      Swal.fire({
        title: '<strong>Form Validation</strong>',
        icon: 'info',
        html:
          `<ul class="list-group errorlist">
           ${ulList}
        </ul>`,
        showCloseButton: true,
        focusConfirm: false,
        confirmButtonText:
          '<i class="fa fa-thumbs-down"></i> Errors!',
        confirmButtonAriaLabel: 'Thumbs down, Errors!',
      })
    }
  }

  openError(res: any) {
    const errorList: any[] = res || [];
    if (errorList.length > 0) {
      console.log(errorList)
      let ulList: any = '';
      for (let index = 0; index < errorList.length; index++) {
        const element = errorList[index];
        ulList += `<li class="list-group-item">
         <div style="color: darkgreen;">Field<span class="mx-2">:</span>${element?.Field}</div>
         <div style="color: red;">Message<span class="mx-2">:</span>${element?.Message}</div>
       </li>`

      }
      Swal.fire({
        title: '<strong>Form Validation</strong>',
        icon: 'info',
        html:
          `<ul class="list-group errorlist">
           ${ulList}
        </ul>`,
        showCloseButton: true,
        focusConfirm: false,
        confirmButtonText:
          '<i class="fa fa-thumbs-down"></i> Errors!',
        confirmButtonAriaLabel: 'Thumbs down, Errors!',
      })

    }
  }
}
