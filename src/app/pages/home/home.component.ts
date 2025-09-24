import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { config } from '../../helpers/appconfig';
import { SharedService } from '../../services/shareService';
import { AuthService } from '../../helpers/auth/Auth/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  showBackToTop = false;
  remarks: any
  modifyCoverSection: any;
  updateRenewal_dialog: boolean = false;
  reason_list: any[] = [];
  companyList: any[] = [];
  RenewalYesNo: any;
  loss_date: any
  customOptions: any = {
    loop: true,
    margin: 20,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 3000,
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      992: { items: 3 }
    }
  };
  policyData: any[] = [];
  showPolicy = false;
  IsCutomerBack: any;
  otp: string[] = ['', '', '', '', '', ''];
  otpControls = Array(6).fill('');
  public RenewalApiUrl: any = config.RenewalApiUrl;
  public CommonApiUrl: any = config.CommonApiUrl;
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  reason1: any;
  loss_type: any;
  conversion: any;
  remarks1: any;
  @HostListener('window:scroll', [])

  onWindowScroll() {
    this.showBackToTop = (window.pageYOffset || document.documentElement.scrollTop) > 300;
  }

  constructor(private router: Router, private shared: SharedService, private datePipe: DatePipe, private authService: AuthService, private route: ActivatedRoute,) {
    {
      // if (this.IsCutomerBack == 'true') {
      //   this.showPolicy = true;
      //   this.finalSubmit();
      // }
      // else {
      //   this.showPolicy = false;
      // }
      this.route.queryParamMap.subscribe((params: any) => {
        this.IsCutomerBack = params.params['status']

      })
      if (this.IsCutomerBack == 'back') {
        // this.showPolicy = true;
        this.finalSubmit();
      }
      else {
        this.showPolicy = false;
      }
    }
  }
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  onInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Allow only digits
    if (!/^[0-9]$/.test(value)) {
      input.value = '';
      return;
    }

    this.otp[index] = value;

    if (value && index < this.otp.length - 1) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        this.focusInput(index - 1);
      }
    }
  }

  focusInput(index: number): void {
    const inputs = this.otpInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  submitOtp(): void {
    this.doAuth();
  }

  Back() {
    this.showPolicy = false;
    sessionStorage.setItem('enteredOtp', '');
    this.router.navigate(['/home'])
  }

  onRenewalChange(value: any) {
    this.remarks1 = null;
    this.updateRenewal_dialog = true;
    this.getCompanyList();
    this.getReasonList();
  }
  onmodifyCoverSectionChange(value: any) {
    // this.remarks = null;
  }

  async doAuth() {

    let urlLink = `${this.CommonApiUrl}authentication/doauth`
    // this.encryptedValue = 'BIxEDbyzljwo1iea31wcJerd+8CHJtGiK5515u9KfTP3UpNpdbuVJD7kmQUmEaWeRJNDJ3S3qqa0Q1q5ccWwzuXidDTUb7eLQNCy8IL3ccyG6R3g13uuQywgCHKF9HcJF+Eil0N7SiyZ6es9cjIdjReiVIqfMWTfcpTZhAe5NwaiEWK3Ue+QrouxeqxfgLijx+BFaT/inhmKteSIavCDr8Wd1WH33SLjFEWCGSnIDSESZZpS5Skx7VS0bsazxg6x+iKM0LFGGwz2Hz3W8IkrCpmj+8G7dCNTbYovkmm3/V0=';
    let d = 'BIxEDbyzljwo1iea31wcJerd+8CHJtGiK5515u9KfTP3UpNpdbuVJD7kmQUmEaWeRJNDJ3S3qqa0Q1q5ccWwzuXidDTUb7eLlrHrPAKjS/2G6R3g13uuQywgCHKF9HcJF+Eil0N7SiyZ6es9cjIdjdsUdwbI2jcmUKmPW7eIhDpzjTFqcqj6jSjEdoDwrOWqGoH9GvnmQQw5QosM8NC6asO40izB/GMs4JlM7vOvIsdl/aES4Ddr1M3EBFxPgy1L0v55deENd0WJrxAdDRyWcVQiBDzd48sBgsptksrcRG4=';
    let ReqObj = {
      "e": d
    };
    (await this.shared.onPostMethodUnAuthAsync(urlLink, ReqObj)).subscribe(
      (data: any) => {
        let res: any = data;
        if (data.Result) {
          if (data.AdditionalInfo) {
            const Token = data?.Result?.Token;
            // this.agencyCode = data?.Result?.OaCode;
            this.authService?.login(data);
            this.authService?.UserToken(Token);
            sessionStorage.setItem('UserToken', Token);
            sessionStorage.setItem('Userdetails', JSON.stringify(data));
            this.finalSubmit();
            // this.generateOtp();
          }

        }
      }
    )
    // }

  }

  finalSubmit() {
    this.showPolicy = false;
    let code: any = null;
    let enteredOtp = null


    if (this.IsCutomerBack == 'back') {
      code = sessionStorage.getItem('enteredOtp');
    }
    else {
      enteredOtp = this.otp.join('');
      code = enteredOtp;
      sessionStorage.setItem('enteredOtp', enteredOtp);
    }
    // sessionStorage.setItem('PolicyNumber', JSON.stringify(customer.PolicyNumber))
    // sessionStorage.setItem('CustomerDeatils', JSON.stringify(customer))
    // this.router.navigate(['/view-policy-details'])

    // let ReqObj = {
    //   "Code": code
    // }

    if (code != '' && code.length == 6) {
      let urlLink = `${this.RenewalApiUrl}renewaltrack/getCodeBasedPolicy/${code}`;
      console.log(urlLink);

      this.shared.onGetMethodSync(urlLink).subscribe(
        (data: any) => {
          if (data.Result != null) {
            // sessionStorage.setItem('enteredOtp', '');
            this.showPolicy = true
            this.policyData = data?.Result;
            sessionStorage.setItem('CustomerDeatils', JSON.stringify(this.policyData[0]))
            this.otp = ['', '', '', '', '', ''];
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Validation',
              html: data?.Message
            });
          }

        })
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Validation',
        html: 'Kindly Enter your 6 digit Code'
      });
    }


  }

  ViewRisk(customer: any, mode: any) {
    let status = 'customer'
    let d = mode
    sessionStorage.setItem('PolicyNumber', JSON.stringify(customer.PolicyNumber))
    sessionStorage.setItem('CustomerDeatils', JSON.stringify(customer))
    this.router.navigate(['/risk-details'], { queryParams: { status, mode: d } })
  }
  updatePolicyLossOrConversion() {
    if (this.RenewalYesNo == 'N') {
      let policyDeatils = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
      let ReqObj = {
        "PolicyNumber": policyDeatils?.PolicyNumber,
        "RenewalDate": this.datePipe.transform(this.loss_date, 'yyyy-MM-dd'),
        "LossReason": this.reason1,
        "LossRemarks": this.remarks1,
        "Competitor": this.loss_type,
        "CurrentStatus": 'RR',
        "PaymentType": this.conversion
      }
      let urlLink = `${this.RenewalApiUrl}renewaltrack/updaterenewpremiapolicy`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Message == 'UpdatedSuccessfully') {
            this.updateRenewal_dialog = false;
            Swal.fire({
              icon: 'info',
              title: 'Validation',
              html: 'Updated Successfully'
            });
          }
          else {
            this.updateRenewal_dialog = false;
            Swal.fire({
              icon: 'error',
              title: 'Validation',
              html: data.Message
            });
          }
        },
        (err: any) => { },
      );
    }
    else {
      let policyDeatils = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
      let enteredOtp = JSON.parse(sessionStorage.getItem('enteredOtp') as any);
      let ReqObj = {
        // "PolicyNumber": this.PolicyNo,
        // "RenewalDate": date,
        "DivisionCode": policyDeatils?.DivisionCode,
        "CompanyId": policyDeatils?.CompanyId,
        "PolicyNumber": policyDeatils?.PolicyNumber,
        "SourceCode": policyDeatils?.SourceCode,
        "SmsCode": enteredOtp,
        "Remark": this.remarks1,
        "UserType": 'user'
      }
      let urlLink = `${this.RenewalApiUrl}renewaltrack/updatePendingPolicy`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Message == 'Success') {
            this.updateRenewal_dialog = false;
            Swal.fire({
              icon: 'success',
              title: 'Validation',
              html: 'We will get back to you with premium thanks...!'
            });
          }
          else {
            this.updateRenewal_dialog = false;
            Swal.fire({
              icon: 'error',
              title: 'Validation',
              html: data.Message
            });
          }
        },
        (err: any) => { },
      );
    }

  }

  getCompanyList() {
    let policyDeatils = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
    let ReqObj = {
      "InsuranceId": policyDeatils.CompanyId,
      "ItemType": "CO_INSURURANCE"
    }
    let urlLink = `${this.CommonApiUrl}master/getbyitemvalue`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        // let defaultObj = [{ "Code": null, "CodeDesc": "--Select--" }]
        this.companyList = data.Result;
      })
  }
  getReasonList() {
    let policyDeatils = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
    let ReqObj = {
      "InsuranceId": policyDeatils.CompanyId,
      "ItemType": "LAST_REASONS"
    }
    let urlLink = `${this.CommonApiUrl}master/getbyitemvalue`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        this.reason_list = data.Result;
      })
  }
}
