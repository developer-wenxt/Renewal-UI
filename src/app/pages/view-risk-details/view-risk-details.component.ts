import { Component, OnInit, ViewChild } from '@angular/core';
import { config } from '../../helpers/appconfig';
import { SharedService } from '../../services/shareService';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { Pipe, PipeTransform } from '@angular/core';
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
  @ViewChild('dt2') dt2!: Table;
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
  RateModified: any;
  PremiumModified: any;
  udpateCoverPlcNo: any;
  udpateCoverRiskId: any;
  udpateCoverSrNo: any;
  updateType: any;
  udpateSectionCode: any;
  SelectedCustomer: any;
  disabled: boolean = false

  constructor(private shared: SharedService, private router: Router) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    this.userDetails.UserType == 'Broker'
    this.disabled = true;
  }
  ngOnInit() {
    this.PolicyNumber = JSON.parse(sessionStorage.getItem('PolicyNumber') as any);
    this.SelectedCustomer = JSON.parse(sessionStorage.getItem('CustomerDeatils') as any);
    this.getRiskDetailsList();
  }

  getRiskDetailsList() {
    let ReqObj = {
      "PolicyNumber": this.PolicyNumber
    }
    let urlLink = `${this.CommonApiUrl}renewaltrack/getRiskIdWithPolicyNo`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Result) {
          this.riskDetails = data.Result;
        }
        else {
          this.riskDetails
        }

        console.log(this.riskDetails, "getRiskIdWithPolicyNo");

      })
  }
  onViewCover(item: any) {
    this.IsView = 'cover'
    let ReqObj = {
      "PolicyNumber": item.PolicyNumber,
      "RiskId": item.RiskId
    }
    let urlLink = `${this.CommonApiUrl}renewaltrack/getDueRenewCover`;
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
      "RiskId": item.RiskId
    }
    let urlLink = `${this.CommonApiUrl}renewaltrack/getDueRenewSMI`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Result) {
          this.visible = true;
          this.sectionList = data.Result;
        }
        else {
          this.riskDetails
        }

        console.log(this.riskDetails, "getRiskIdWithPolicyNo");

      })
  }

  onGlobalFilter1(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt1.filterGlobal(input.value, 'contains');
  }
  onGlobalFilter2(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }

  navigatebroker() {

    if (this.userDetails.UserType == 'Broker') {
      let value = 'back'
      this.router.navigate(['/broker'], { queryParams: { value } })

    }
    else {
      let value = 'Issuer'
      this.router.navigate(['/branch-dashboard'], { queryParams: { value } })

    }
    // this.router.navigate(['/broker'])
  }

  onupdateCover(event: any, data: any, type: any) {
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

  updateCoverDetails() {
    if (this.updateType != 'section') {
      let ReqObj = {
        "PolicyNumber": this.udpateCoverPlcNo,
        "RiskId": this.udpateCoverRiskId,
        "SrNo": this.udpateCoverSrNo,
        "SumInsuredModified": this.SumInsuredModified,
        "RateModified": this.RateModified,
        "PremiumModified": this.PremiumModified
      }
      let urlLink = `${this.CommonApiUrl}renewaltrack/updateDueRenewCover`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Result) {
            this.AddCover_dialog = false;
            this.dt1.cancelRowEdit(ReqObj);
            this.onViewCover(ReqObj);
          }

        })
    }
    else {
      let ReqObj = {
        "PolicyNumber": this.udpateCoverPlcNo,
        "RiskId": this.udpateCoverRiskId,
        "Code": this.udpateSectionCode,
        "SumInsuredModified": this.SumInsuredModified,
        "RateModified": this.RateModified,
        "PremiumModified": this.PremiumModified
      }
      let urlLink = `${this.CommonApiUrl}renewaltrack/updateDueRenewSmi`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Result) {
            this.AddCover_dialog = false;
            this.onViewSection(ReqObj);
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

}
