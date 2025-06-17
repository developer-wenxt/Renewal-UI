import { Injectable } from '@angular/core';
import { SessionStorageModel } from './session-storage-model';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {

  sessionStorgaeModel: SessionStorageModel = new SessionStorageModel();
  constructor() {

  }




  public set(key: string, value: string) {
    this.sessionStorgaeModel[key] = value;
    // sessionStorage.setItem('sessionStorgaeModel',JSON.stringify(this.sessionStorgaeModel));
  }
  get(key: string): string | null {
    return this.sessionStorgaeModel[key]
  }
  remove(key: string) {
    this.sessionStorgaeModel[key] = null;
    // sessionStorage.setItem('sessionStorgaeModel',JSON.stringify(this.sessionStorgaeModel));

  }
  clear() {
    this.sessionStorgaeModel = new SessionStorageModel();
    // sessionStorage.setItem('sessionStorgaeModel',JSON.stringify(this.sessionStorgaeModel));
  }
}
