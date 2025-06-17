import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private itemsSubject = new BehaviorSubject<any[]>([]);
  items$ = this.itemsSubject.asObservable();
  private selectedLabelSource = new BehaviorSubject<string | null>(null);
  selectedLabel$ = this.selectedLabelSource.asObservable();
  private userTypeSource = new BehaviorSubject<string | null>(null);
  userType$ = this.userTypeSource.asObservable();

  updateItems(items: any[]) {
    this.itemsSubject.next(items);
  }
  selectItem(label: string) {
    this.selectedLabelSource.next(label);
  }

  setUserType(userType: string) {
    this.userTypeSource.next(userType);
  }
}