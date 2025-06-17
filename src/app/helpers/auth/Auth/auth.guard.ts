import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isLoggedIn.pipe(
      take(1),
      map((isLoggedIn: boolean) => {
        if(isLoggedIn){
          return true;
          // if(this.router.url=='/'){
          //   alert(this.router.url)
          //   this.router.navigate(['/Home']);
           
          // }
          // else{
          //   return true;
          // }
        }else{
          if(this.router.url=='/b2clogin') return true;
          else{
            this.router.navigate(['/login']);
          return false;
          }
        }
      })
    );
  }


}
