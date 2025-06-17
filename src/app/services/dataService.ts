
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataSubject = new BehaviorSubject<boolean>(false);

  dataTouched$ = this.dataSubject.asObservable();

  markDraTextAsUntouched() {
    this.dataSubject.next(false);
  }
  private passmenuName = new Subject<string>();

  functionCalled$ = this.passmenuName.asObservable();


  sendMenuName(menuName:any) {
    this.passmenuName.next(menuName);
  }
 
}
