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
  selector: 'app-product-grid',
  standalone: false,
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss'
})
export class ProductGridComponent implements OnInit {
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

    let urlLink = `${this.RenewalApiUrl}renewaltrack/getproductsbycompanyanddivision`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.tableList = data?.Result
        }
      },
      (err: any) => { },
    );


  }
  view(data: any) {
    let value = 'Issuer'
    // this.router.navigate(['/branch-dashboard'], { queryParams: { value } })
    console.log(data, "kjsdkjfhsdjfhsjkdhfskjfhsfkjgg");

    sessionStorage.setItem('SelecttedProduct', JSON.stringify(data));
    this.visible = true;
    this.getbrokerList();
  }
  navigateOprationHeadDasborad() {
    let value = 'back'
    this.router.navigate(['/dashboard'], { queryParams: { value } })
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
    const doc = new jsPDF('portrait');

    let logoPath = '';
    switch (this.userDetails.InsuranceId) {
      case '100046':
        logoPath = 'assets/phoenixAlt.png';
        break;
      case '100047':
        logoPath = 'assets/cropped-botwa.png';
        break;
      case '100048':
        logoPath = 'assets/PhoenixMozambique.png';
        break;
      case '100049':
        logoPath = 'assets/cropped-swaziland.png';
        break;
      case '100050':
        logoPath = 'assets/cropped-NAMIBIA-LOGO-1.png';
        break;
      case '100002':
        logoPath = 'assets/alliance-img-1.png';
        break;
      case '100020':
        logoPath = 'assets/FirstAssurance.png';
        break;
      default:
        logoPath = 'assets/phoneix-logo.png';
    }

    const img = new Image();
    img.src = logoPath;

    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 15);
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Product Report', 80, 20);


      const now = new Date();
      const dateStr = now.toLocaleString();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(dateStr, doc.internal.pageSize.getWidth() - 50, 10);

      const headers = [['Product Code', 'Product Name', 'Premium', 'Success', 'Pending', 'Lost', 'Total']];
      const data = this.tableList.map(row => [
        row.ProductCode,
        row.ProductName,
        row.TotalPremium,
        row.Success,
        row.Pending,
        row.Lost,
        row.ProductCount
      ]);

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [40, 40, 40] },
        margin: { top: 10 }
      });

      doc.save(`product-report-${new Date().getTime()}.pdf`);
    };

    img.onerror = () => {
      console.error('Logo image failed to load. Generating PDF without logo.');
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Product Report', 80, 20);

      const now = new Date();
      const dateStr = now.toLocaleString();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(dateStr, doc.internal.pageSize.getWidth() - 50, 10);

      const headers = [['Product Code', 'Product Name', 'Premium', 'Success', 'Pending', 'Lost', 'Total']];
      const data = this.tableList.map(row => [
        row.ProductCode,
        row.ProductName,
        row.TotalPremium,
        row.Success,
        row.Pending,
        row.Lost,
        row.ProductCount
      ]);

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [40, 40, 40] },
        margin: { top: 10 }
      });

      doc.save(`product-report-${new Date().getTime()}.pdf`);
    };
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

    let urlLink = `${this.RenewalApiUrl}renewaltrack/getsourcesbyproduct`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data?.Result) {
          this.brokerList = data?.Result;
          sessionStorage.setItem('brokerList', JSON.stringify(this.brokerList));
        }
      },
      (err: any) => { },
    );


  }
  viewCustomer(data: any) {
    let value = 'Issuer'
    this.router.navigate(['/branch-dashboard'], { queryParams: { value } })
    sessionStorage.setItem('division', JSON.stringify(data));
  }

  visibleBack() {
    this.visible = false;
    this.getSourcebyCompanyandDivision();
  }

}
