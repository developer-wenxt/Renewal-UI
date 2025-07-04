import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../../services/shareService';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from '../../storage/session-storage.service';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../helpers/auth/Auth/auth.service';
import { DatePipe } from '@angular/common';
import { config } from '../../helpers/appconfig';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-new-business-products-grid',
  standalone: false,
  templateUrl: './new-business-products-grid.component.html',
  styleUrl: './new-business-products-grid.component.scss'
})
export class NewBusinessProductsGridComponent {
  @ViewChild('dt4') dt4!: Table;
  @ViewChild('dt5') dt5!: Table;
  public RenewalApiUrl: any = config.RenewalApiUrl;
  userDetails: any;
  tableList: any[] = [];
  divistionData: any;
  from_date: any;
  visible: boolean = false;
  to_date: any;
  brokerList: any
  ProductData: any;
  checkFlow: any;


  constructor(private shared: SharedService, private router: Router, private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute, private sidebarService: SidebarService, private authService: AuthService, private datePipe: DatePipe,) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    this.divistionData = JSON.parse(sessionStorage.getItem('DivistionDetails') as any);
    this.from_date = sessionStorage.getItem('from_date_op') as any;
    this.to_date = sessionStorage.getItem('to_date_op') as any;

  }
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: any) => {
      this.checkFlow = params.params['value']
      if (this.checkFlow == 'back') {
        this.getbrokerList();
        this.visible = true;
      }
      else {
        this.getSourcebyCompanyandDivision();
        this.visible = false;

      }
    });

  }

  getSourcebyCompanyandDivision() {

    let ReqObj

    ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCode": this.divistionData.DivisionCode,
      "StartDate": this.from_date,
      "EndDate": this.to_date
    }

    let urlLink = `${this.RenewalApiUrl}nbtrack/getproductsbycompanyanddivision`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.tableList = data
        }
      },
      (err: any) => { },
    );


  }
  view(data: any) {
    let value = 'Issuer'
    // this.router.navigate(['/branch-dashboard'], { queryParams: { value } })
    console.log(data,"kjsdkjfhsdjfhsjkdhfskjfhsfkjgg");
    
    sessionStorage.setItem('SelecttedProduct', JSON.stringify(data));
    this.visible = true;
    this.getbrokerList();
  }
  navigateOprationHeadDasborad() {
    let value = 'back'
    this.router.navigate(['/new-business-dashboard'], { queryParams: { value } })
  }

  formatDate(date: any): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  onGlobalFilterBroker(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt4.filterGlobal(input.value, 'contains');
  }
  onGlobalFilterBroker1(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt5.filterGlobal(input.value, 'contains');
  }

  exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.tableList);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'product_report');
  }

  exportPdf() {
    const doc = new jsPDF('landscape'); // use 'portrait' if you prefer

    // Define table headers (same order as your p-table)
    const headers = [['Product Code', 'Product Name', 'Premium', 'Success', 'Pending', 'Lost', 'Total']];

    // Prepare data rows from tableList
    const data = this.tableList.map(row => [
      row.ProductCode,
      row.ProductName,
      row.TotalPremium,
      row.Success,
      row.Pending,
      row.Lost,
      row.ProductCount
    ]);

    // Generate the table
    autoTable(doc, {
      head: headers,
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40] },
      margin: { top: 20 }
    });

    // Save PDF
    doc.save(`product-report-${new Date().getTime()}.pdf`);
  }


  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
  }

  getbrokerList() {
    this.ProductData = JSON.parse(sessionStorage.getItem('SelecttedProduct') as any);
    let ReqObj

    ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCode": this.divistionData.DivisionCode,
      "StartDate": this.from_date,
      "EndDate": this.to_date,
      "ProductCode": this.ProductData?.ProductCode,

    }

    let urlLink = `${this.RenewalApiUrl}nbtrack/getsourcesbyproduct`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data  ) {
          this.brokerList = data;
          sessionStorage.setItem('brokerList', JSON.stringify(this.brokerList));
        }
      },
      (err: any) => { },
    );


  }
  viewCustomer(data: any) {
    let value = 'Issuer'
    this.router.navigate(['/new-business-branch-dashboard'], { queryParams: { value } })
    sessionStorage.setItem('division', JSON.stringify(data));
  }

  visibleBack() {
    this.visible = false;
    this.getSourcebyCompanyandDivision();
  }
}
