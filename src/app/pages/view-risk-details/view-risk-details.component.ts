import { Component, OnInit, ViewChild } from '@angular/core';
import { config } from '../../helpers/appconfig';
import { SharedService } from '../../services/shareService';
import { Table } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Pipe, PipeTransform } from '@angular/core';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-view-risk-details',
  standalone: false,
  templateUrl: './view-risk-details.component.html',
  styleUrl: './view-risk-details.component.scss'
})
export class ViewRiskDetailsComponent implements OnInit {
  @Pipe({
    name: 'numberComma'
  })
  @ViewChild('dt1') dt1!: Table;
  @ViewChild('dt') dt!: Table;
  @ViewChild('dt2') dt2!: Table;
  public RenewalApiUrl: any = config.RenewalApiUrl;
  public CommonApiUrl: any = config.CommonApiUrl;
  PolicyNumber: any;
  visible: boolean = false;
  AddCover_dialog: boolean = false;
  IsView: any;
  riskDetails: any;
  userDetails: any;
  coverList: any[] = [];
  sectionList: any[] = [];
  SumInsuredModified: any;
  riks_list: any[] = [];
  RateModified: any;
  PremiumModified: any;
  udpateCoverPlcNo: any;
  risk_dialog: boolean = false;
  showCommissionPopup: boolean = false;
  udpateCoverRiskId: any;
  udpateCoverSrNo: any;
  updateType: any;
  udpateSectionCode: any;
  SelectedCustomer: any;
  checkFlow: any;
  riskId: any;
  Typevalue: any;
  updateRiks_dialog: boolean = false;
  disabled: boolean = false;
  remarks: any;
  remarks1: any;
  loss_type: any;
  selectedRik: any;
  reason: any;
  reason1: any;
  commissionDetails: any;
  mode: any;
  loss_date: any;
  reason_list: any[] = [];
  payment_type_list: any[] = [];
  companyList: any[] = [];
  conversion: any[] = [];
  selectedCovers: any[] = [];
  selectedSections: any[] = [];
  updateRenewal_dialog: boolean = false;
  RenewalYesNo: any;
  constructor(private shared: SharedService, private router: Router, private route: ActivatedRoute, private confirmationService: ConfirmationService, private messageService: MessageService) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    this.userDetails.UserType == 'Broker'
    this.disabled = true;
    this.route.queryParamMap.subscribe((params: any) => {
      this.checkFlow = params.params['status'];
      this.mode = params.params['mode'];

    })
  }
  ngOnInit() {
    this.PolicyNumber = JSON.parse(sessionStorage.getItem('PolicyNumber') as any);
    this.SelectedCustomer = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
    // if (this.checkFlow == 'customer') {
    this.getRiskList();
    // }
    // else {
    //   this.getRiskDetailsList();

    // }
  }

  getRiskDetailsList() {
    let ReqObj = {
      "PolicyNumber": this.PolicyNumber
    }
    // let urlLink = `${this.RenewalApiUrl}renewaltrack/getRiskIdWithPolicyNo`;
    let urlLink
    if (this.checkFlow == 'newbusiness') {
      urlLink = `${this.RenewalApiUrl}nbtrack/getRiskIdWithPolicyNo`;
    }
    else {
      urlLink = `${this.RenewalApiUrl}renewaltrack/getRiskIdWithPolicyNo`;
    }
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Result) {
          this.riskDetails = data.Result;
          if (this.riskId != null) {
            this.riskDetails = this.riskDetails.filter((ele: { RiskId: any; }) => ele.RiskId == this.riskId);
          }
        }
        else {
          this.riskDetails
        }

        console.log(this.riskDetails, "getRiskIdWithPolicyNo");

      })
  }

  getRiskList() {
    let ReqObj = {
      "PolicyNumber": this.PolicyNumber
    }
    let urlLink
    if (this.checkFlow == 'newbusiness') {
      urlLink = `${this.RenewalApiUrl}nbtrack/getRiskDetails`;
    }
    else {
      urlLink = `${this.RenewalApiUrl}renewaltrack/getRiskDetails`;
    }
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Result) {
          this.riks_list = data.Result;
        }

      })
  }
  onViewCover(item: any) {
    this.IsView = 'cover'
    this.selectedCovers = [];
    let ReqObj = {
      "PolicyNumber": item.PolicyNumber,
      "SectionCode": item.SectionCode,
      // "SectionDesc": item.SectionDesc,
      "RiskId": item.RiskId
    }
    // let urlLink = `${this.RenewalApiUrl}renewaltrack/getDueRenewCover`;
    let urlLink
    if (this.checkFlow == 'newbusiness') {
      urlLink = `${this.RenewalApiUrl}nbtrack/getDueRenewCover`;
    }
    else {
      urlLink = `${this.RenewalApiUrl}renewaltrack/getDueRenewCover`;
    }
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Result) {
          this.visible = true;
          this.coverList = data.Result;
          this.coverList = data.Result.map((cover: any) => {
            return {
              ...cover,
              SumInsured: this.parseToNumber(cover.SumInsured),
              Rate: this.parseToNumber(cover.Rate),
              RatePer: this.parseToNumber(cover.RatePer),
              Premium: this.parseToNumber(cover.Premium),
              SumInsuredModified: this.parseToNumber(cover.SumInsuredModified),
              RateModified: this.parseToNumber(cover.RateModified),
              PremiumModified: this.parseToNumber(cover.PremiumModified)
            };
          });
          this.selectedCovers = this.coverList.filter(item => item.DeletedModifiedFlag == 'Y');
        }
        else {
          this.riskDetails
        }

        console.log(this.riskDetails, "getRiskIdWithPolicyNo");

      })
  }
  onViewSection(item: any) {
    this.IsView = 'section'
    let ReqObj = {
      "PolicyNumber": item.PolicyNumber,
      "RiskId": item.RiskId,
    }
    // let urlLink = `${this.RenewalApiUrl}renewaltrack/getDueRenewSMI`;
    let urlLink
    if (this.checkFlow == 'newbusiness') {
      urlLink = `${this.RenewalApiUrl}nbtrack/getDueRenewSMI`;
    }
    else {
      urlLink = `${this.RenewalApiUrl}renewaltrack/getDueRenewSMI`;
    }
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Result) {
          this.visible = true;
          this.sectionList = data.Result;
          this.selectedSections = this.sectionList.filter(item => item.DeletedModifiedFlag == 'Y');
        }
        else {
          this.riskDetails
        }

        console.log(this.riskDetails, "getRiskIdWithPolicyNo");

      })
  }

  onAccept(event: MouseEvent, row: any, btnElement: HTMLElement): void {
    console.log('Accept clicked', row);
    this.updateRiks_dialog = true;
    this.getReasonList();
    this.Typevalue = 'Conversion';
    this.selectedRik = row;
    // this.confirmationService.confirm({
    //   target: btnElement, 
    //   message: 'Are you sure that you want to proceed?',
    //   header: 'Confirmation',
    //   icon: 'pi pi-exclamation-triangle',
    //   acceptIcon: 'none',
    //   rejectIcon: 'none',
    //   rejectButtonStyleClass: 'p-button-text',
    //   accept: () => {
    //     this.messageService.add({
    //       severity: 'info',
    //       summary: 'Confirmed',
    //       detail: `You accepted the request for ID: ${row.TransactionId}`
    //     });
    //     this.updateRiks_dialog = true;
    //     this.Typevalue = 'Conversion';
    //     this.selectedRik = row;
    //   },
    //   reject: () => {
    //     this.messageService.add({
    //       severity: 'warn',
    //       summary: 'Rejected',
    //       detail: `You rejected the request for ID: ${row.TransactionId}`,
    //       life: 3000
    //     });
    //   }
    // });
  }


  onReject(event: MouseEvent, row: any, btnElement: HTMLElement): void {
    console.log('Accept clicked', row);

    // this.confirmationService.confirm({
    //   target: btnElement, // anchor the popup to button
    //   message: 'Are you sure that you want to proceed?',
    //   header: 'Confirmation',
    //   icon: 'pi pi-exclamation-triangle',
    //   acceptIcon: 'none',
    //   rejectIcon: 'none',
    //   rejectButtonStyleClass: 'p-button-text',
    //   accept: () => {
    //     this.messageService.add({
    //       severity: 'info',
    //       summary: 'Confirmed',
    //       detail: `You accepted the request for ID: ${row.TransactionId}`
    //     });
    //     this.updateRiks_dialog = true;
    //     this.Typevalue = 'Lost';
    //     this.selectedRik = row;
    //   },
    //   reject: () => {
    //     this.messageService.add({
    //       severity: 'warn',
    //       summary: 'Rejected',
    //       detail: `You rejected the request for ID: ${row.TransactionId}`,
    //       life: 3000
    //     });
    //   }
    // });
    this.updateRiks_dialog = true;
    this.Typevalue = 'Lost';
    this.selectedRik = row;
    this.getReasonList();
  }
  onviewRisk(data: any) {
    this.riskId = null
    this.risk_dialog = true;
    this.riskId = data?.RiskId;
    this.getRiskDetailsList();
  }

  onGlobalFilter1(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt1.filterGlobal(input.value, 'contains');
  }
  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }
  onGlobalFilter2(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }

  navigatebroker() {
    if (this.userDetails.UserType == 'Broker' && (this.checkFlow == undefined || this.checkFlow == null || this.checkFlow == '')) {
      let value = 'back'
      this.router.navigate(['/broker'], { queryParams: { value } })

    }
    if (this.userDetails.UserType == 'Issuer' && (this.checkFlow == undefined || this.checkFlow == null || this.checkFlow == '')) {
      let value = 'Issuer'
      this.router.navigate(['/branch-dashboard'], { queryParams: { value } })

    }

    if (this.checkFlow === 'pending') {
      this.router.navigate(['/renewal/renewal-approval'], { queryParams: { status: 'pending' } });
    }

    if (this.checkFlow === 'completed') {
      this.router.navigate(['/renewal/renewal-approval'], { queryParams: { status: 'completed' } });
    }

    if (this.checkFlow === 'rejected') {
      this.router.navigate(['/renewal/renewal-approval'], { queryParams: { status: 'rejected' } });
    }

    if (this.checkFlow == 'customer') {
      this.router.navigate(['/home'], { queryParams: { status: 'back' } });
    }
    if (this.checkFlow == 'newbusiness') {
      if (this.userDetails.UserType == 'Broker') {
        let value = 'back'
        this.router.navigate(['/new-business-broker'], { queryParams: { value } })

      }
      else {
        let value = 'Issuer'
        this.router.navigate(['/new-business-branch-dashboard'], { queryParams: { value } })

      }
    }

    // this.router.navigate(['/broker'])
  }

  onupdateCover(event: any, data: any, type: any) {
    if (type != 'cover-reject') {
      event.stopPropagation();
      this.dt1.initRowEdit(data);
      this.updateType = type
      // this.AddCover_dialog = true;
      this.udpateCoverPlcNo = data?.PolicyNumber;
      this.udpateCoverRiskId = data?.RiskId;
      this.udpateCoverSrNo = data?.SrNo;
      this.udpateSectionCode = data?.SmiCode;
      this.RateModified = data?.RateModified;
      this.PremiumModified = data?.PremiumModified;
      this.SumInsuredModified = data?.SumInsuredModified;
      this.updateCoverDetails();
    }
    else {
      this.updateType = type
      // this.AddCover_dialog = true;
      this.udpateCoverPlcNo = data?.PolicyNumber;
      this.udpateCoverRiskId = data?.RiskId;
      this.udpateCoverSrNo = data?.SrNo;
      this.udpateSectionCode = data?.SmiCode;
      this.RateModified = data?.RateModified;
      this.PremiumModified = data?.PremiumModified;
      this.SumInsuredModified = data?.SumInsuredModified;
      this.updateCoverDetails();
    }

  }

  updateCoverDetails() {
    if (this.updateType == 'cover') {
      let ReqObj: any
      if (this.checkFlow == 'customer') {
        ReqObj = {
          "PolicyNumber": this.udpateCoverPlcNo,
          "RiskId": this.udpateCoverRiskId,
          "SrNo": this.udpateCoverSrNo,
          "SumInsuredModified": this.SumInsuredModified,
          "RateModified": this.RateModified,
          "PremiumModified": this.PremiumModified,
          "UpdatedBy": 'user'
        }
      }
      else {
        let policyDeatils = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
        let sts
        if (policyDeatils?.Status == 'CP') {
          sts = 'CA'
        }
        else {
          sts = 'BA'
        }

        ReqObj = {
          "PolicyNumber": this.udpateCoverPlcNo,
          "RiskId": this.udpateCoverRiskId,
          "SrNo": this.udpateCoverSrNo,
          "SumInsuredModified": this.SumInsuredModified,
          "RateModified": this.RateModified,
          "PremiumModified": this.PremiumModified,
          "UpdatedBy": this.userDetails?.UserType,
          "Status": sts
        }
      }

      let urlLink = `${this.RenewalApiUrl}renewaltrack/updateDueRenewCover`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Result) {
            this.visible = false;
            Swal.fire({
              icon: 'info',
              title: 'Validation',
              html: 'Updated Successfully'
            });
            this.dt1.cancelRowEdit(ReqObj);
            this.onViewCover(ReqObj);
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
    if (this.updateType == 'section') {
      let ReqObj = {
        "PolicyNumber": this.udpateCoverPlcNo,
        "RiskId": this.udpateCoverRiskId,
        "Code": this.udpateSectionCode,
        "SumInsuredModified": this.SumInsuredModified,
        "RateModified": this.RateModified,
        "PremiumModified": this.PremiumModified
      }
      let urlLink = `${this.RenewalApiUrl}renewaltrack/updateDueRenewSmi`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Result) {
            this.visible = false;
            Swal.fire({
              icon: 'info',
              title: 'Validation',
              html: 'Updated Successfully'
            });
            this.onViewSection(ReqObj);
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

    if (this.updateType == 'cover-reject') {
      let policyDeatils = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
      let sts
      if (policyDeatils?.Status == 'CP' || policyDeatils?.Status == 'CA') {
        sts = 'CR'
      }
      else {
        sts = 'BR'
      }
      let ReqObj = {
        "PolicyNumber": this.udpateCoverPlcNo,
        "RiskId": this.udpateCoverRiskId,
        "SrNo": this.udpateCoverSrNo,
        "SumInsuredModified": this.SumInsuredModified,
        "RateModified": this.RateModified,
        "PremiumModified": this.PremiumModified,
        "UpdatedBy": this.userDetails.UserType,
        "Status": sts
      }
      let urlLink = `${this.RenewalApiUrl}renewaltrack/updateDueRenewCover`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Result) {
            this.AddCover_dialog = false;
            Swal.fire({
              icon: 'info',
              title: 'Validation',
              html: 'Updated Successfully'
            });
            this.onViewSection(ReqObj);
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

  }
  groupRiskInPairs(risks: any[]): any[][] {
    const pairs = [];
    for (let i = 0; i < risks.length; i += 2) {
      pairs.push(risks.slice(i, i + 2));
    }
    return pairs;
  }
  groupRiskInTriplets(risks: any[]): any[][] {

    const triplets = [];
    for (let i = 0; i < risks.length; i += 2) {
      triplets.push(risks.slice(i, i + 2));
    }
    return triplets;
  }

  // transform(value: number | string): string {
  //   if (value === null || value === undefined) return '';
  //   const num = typeof value === 'string' ? Number(value.replace(/,/g, '')) : value;
  //   return num.toLocaleString('en-IN'); // For Indian format
  // }
  updateModifiedValue(event: any, cover: any, field: string) {
    const value = event.target.value.replace(/,/g, '');
    const parsedValue = parseFloat(value);
    cover[field] = isNaN(parsedValue) ? null : parsedValue;
  }
  allowNumberAndCommaOnly(event: KeyboardEvent) {
    const allowedChars = /[0-9,]/;
    const key = event.key;

    if (!allowedChars.test(key)) {
      event.preventDefault();
    }
  }

  parseToNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }
  UpdateCustomerStatus() {
    let sts = null;
    if (this.Typevalue == 'Lost') {
      sts = 'R'
    }
    else {
      sts = 'A'
    }
    let ReqObj = {
      "PolicyNumber": this.selectedRik?.PolicyNumber,
      "RiskId": this.selectedRik?.RiskId,
      "SectionCode": this.selectedRik?.SectionCode,
      "Reason": this.reason,
      "Remark": this.remarks,
      "Status": sts
    }
    let urlLink = `${this.RenewalApiUrl}renewaltrack/updateRiskDetail`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Result) {
          // this.visible = true;
          // this.coverList = data.Result;
          Swal.fire({
            icon: 'info',
            title: 'Validation',
            html: 'Updated Successfully'
          });
          this.updateRiks_dialog = false;
        }

      })
  }

  updateCoverDetailsIsNotRequired() {
    if (this.IsView == 'cover') {
      let coversList = this.coverList;
      const result = coversList.map(item => ({
        Code: item.Code,
        SrNo: item.SrNo,
        NotRequired: this.selectedCovers.some(selected => selected.Code === item.Code) ? 'Y' : 'N',
        Remark: item.Remark || ''
      }));


      let ReqObj = {
        "PolicyNumber": coversList[0]?.PolicyNumber,
        "SectionCode": coversList[0]?.SectionCode,
        "TransactionId": coversList[0]?.TransactionId,
        "RiskId": coversList[0]?.RiskId,
        "NotRequiredList": result,

      }
      console.log(ReqObj, "req");

      let urlLink = `${this.RenewalApiUrl}renewaltrack/updateCover`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Result) {
            this.visible = false;
            Swal.fire({
              icon: 'info',
              title: 'Validation',
              html: 'Updated Successfully'
            });

          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Validation',
              html: data.Message
            });
          }
        })
    }

    else {
      let sections = this.sectionList;
      const sectionResult = sections.map(item => ({
        Code: item.SectionCode,
        SrNo: item.SmiCode,
        NotRequired: this.selectedSections.some(selected => selected.SectionCode === item.SectionCode) ? 'Y' : 'N',
        Remark: item.Remark || ''
      }));


      let ReqObj1 =
      {
        "PolicyNumber": sections[0]?.PolicyNumber,
        "TransactionId": sections[0]?.TransactionId,
        "RiskId": sections[0]?.RiskId,
        "NotRequiredList": sectionResult
      }


      let urlLink1 = `${this.RenewalApiUrl}renewaltrack/updateSMI`;
      this.shared.onPostMethodSync(urlLink1, ReqObj1).subscribe(
        (data: any) => {
          if (data.Result) {
            this.visible = false;
            Swal.fire({
              icon: 'info',
              title: 'Validation',
              html: 'Updated Successfully'
            });

          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Validation',
              html: data.Message
            });
          }
        })
    }


  }
  handleSelectionChange(event: any) {
    console.log('Selected covers:', event);
    this.selectedCovers = event;
  }
  handleSectionSelectionChange(event: any) {
    console.log('Selected covers:', event);
    this.selectedCovers = event;
  }

  CutomerUpdatedDatasendToBroker() {
    this.updateRenewal_dialog = true;
    this.getCompanyList();
    this.getReasonList();
  }
  onRenewalChange(value: any) {
    this.remarks1 = null;
  }

  updatePolicyLossOrConversion() {
    if (this.RenewalYesNo == 'N') {
      let ReqObj = {
        // "PolicyNumber": this.PolicyNo,
        // "RenewalDate": date,
        "LossReason": this.reason1,
        "LossRemarks": this.remarks,
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
          if (data.Message == 'UpdatedSuccessfully') {
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

  onViewCommission(data: any) {
    let policyDeatils = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
    let ReqObj = {
      "SourceCode": policyDeatils?.SourceCode,
      "PolicyNumber": data?.PolicyNumber,
      "SectionCode": data?.SectionCode

    }
    let urlLink = `${this.RenewalApiUrl}renewaltrack/getCommission`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Result) {
          // this.commissionDetails = data.Result;
          this.commissionDetails = data.Result;
          this.showCommissionPopup = true;
        }
        else {
          Swal.fire({
            icon: 'info',
            title: 'Validation',
            html: data?.Message
          });
        }
      })
  }
}


