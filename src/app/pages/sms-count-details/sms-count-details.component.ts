import { Component, OnInit, ViewChild } from '@angular/core';
import { config } from '../../helpers/appconfig';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shareService';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-sms-count-details',
  standalone: false,
  templateUrl: './sms-count-details.component.html',
  styleUrl: './sms-count-details.component.scss'
})
export class SmsCountDetailsComponent implements OnInit {
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('dt1') dt1!: Table;
  public RenewalApiUrl: any = config.RenewalApiUrl;
  smsSendCountList: any[] = [];
  smsNotSendCountList: any[] = [];
  overall_count: any[] = [];
  userDetails: any;
  showGrid: boolean = false;
  transactionId: any;

  constructor(
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private shared: SharedService
  ) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
  }

  ngOnInit(): void {
    this.getsmscount();
  }
  getPercentage(part: number, total: number): string {
    if (!total) return '0';
    return ((part / total) * 100).toFixed(2);
  }

  viewList(item: any): void {
    this.transactionId = null;
    this.transactionId = item?.transactionId
    this.showGrid = true;
    this.getSendList(item);
    this.getNotSendList(item)


  }
  onGlobalFilter1(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt1.filterGlobal(input.value, 'contains');
  }
  onGlobalFilter2(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }
  getSendList(item: any) {
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCode": this.userDetails?.DivisionCode,
      "transactionId": item?.transactionId

    }

    let urlLink = `${this.RenewalApiUrl}renewaltrack/getSmsSentPolicy`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {

          this.smsSendCountList = data.Result

        }
      },
      (err: any) => { },
    );
  }
  getNotSendList(item: any) {
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCode": this.userDetails?.DivisionCode,
      "transactionId": item?.transactionId

    }

    let urlLink = `${this.RenewalApiUrl}renewaltrack/getSmsNotSentPolicy`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {

          this.smsNotSendCountList = data.Result

        }
      },
      (err: any) => { },
    );
  }
  getsmscount() {
    let ReqObj
    ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCode": this.userDetails?.DivisionCode,
    }

    let urlLink = `${this.RenewalApiUrl}renewaltrack/getSMSDetails`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {

          this.overall_count = data.Result

        }
      },
      (err: any) => { },
    );
  }

  onTabChange(event: any) {
    const selectedIndex = event.index;
    const selectedTabLabel = event.originalEvent.target.innerText;

    console.log('Tab Changed:', selectedIndex, selectedTabLabel);

    if (selectedIndex === 0) {

    }
    else if (selectedIndex === 1) {


    }

  }
  back() {
    this.showGrid = false;
  }
  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case 'RL':
        return 'secondary';
      case 'RP':
        return 'warning';
      case 'RR':
        return 'danger';
      case 'Motor':
        return 'info';
      case 'RC':
        return 'success';
      case 'Non-Motor':
        return 'contrast';
      default:
        return undefined;
    }
  }
}
