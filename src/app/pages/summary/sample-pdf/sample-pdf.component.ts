import { Component, ElementRef, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { SharedService } from '../../../services/shareService';
@Component({
  selector: 'app-sample-pdf',
  standalone: false,
  templateUrl: './sample-pdf.component.html',
  styleUrl: './sample-pdf.component.scss'
})
export class SamplePdfComponent {
  PremiumCurrency: any;
  PolicyStartDate: any;
  PolicyEndDate: any;
  CompanyName: any;
  FirstName: any;
  constructor(private shared: SharedService) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);

  }
  @ViewChild('policyContent', { static: false }) policyContent!: ElementRef;
  policyNumber: string = '';
  sumInsured: string = '';
  limitOfLiability: string = '';
  premiumAmount: string = '';
  signDay: string = '';
  signMonth: string = '';
  signYear: string = '';
  authorisedSignatory: string = '';



  // generatePdf() {
  //   const DATA: HTMLElement = this.policyContent.nativeElement;
  //   const doc = new jsPDF('p', 'mm', 'a4');
  //   const marginTop = 20;
  //   const marginLeft = 15;
  //   const marginRight = 15;
  //   const pageWidth = 210;
  //   const pageHeight = 297;
  //   const contentWidth = pageWidth - marginLeft - marginRight;

  //   const options = {
  //     backgroundColor: '#ffffff',
  //     scale: 2,
  //     scrollY: 0
  //   };

  //   html2canvas(DATA, options).then((canvas) => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const imgWidth = contentWidth;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     let heightLeft = imgHeight;
  //     let position = marginTop;

  //     // Add first page
  //     addHeader(doc);
  //     doc.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
  //     heightLeft -= (pageHeight - marginTop);

  //     // Add more pages if needed
  //     while (heightLeft > 0) {
  //       position = marginTop - (imgHeight - heightLeft);

  //       doc.addPage();
  //       addHeader(doc);
  //       doc.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);

  //       heightLeft -= (pageHeight - marginTop);
  //     }

  //     doc.save('YARA_Rice_Policy.pdf');
  //   });

  //   function addHeader(doc: jsPDF) {
  //     doc.setFontSize(11);
  //     doc.setTextColor(40);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('YARA Rice Weather Index Insurance - Policy Document', marginLeft, 10);
  //     doc.setDrawColor(0);
  //     doc.setLineWidth(0.5);
  //     doc.line(marginLeft, 12, pageWidth - marginRight, 12); // Horizontal line
  //   }
  // }


  generatePdf() {
    const element = this.policyContent.nativeElement;

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5], // top, left, bottom, right (in inches)
      filename: 'YARA_Rice_Policy.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  }
  getPolSumCumulative() {

    let ReqObj = {
      "QuoteNo": "AICQ15991"
    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    // let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getCumulativePolicyList`;
    let urlLink = `http://192.168.1.42:8086/api/yara/document/details`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.policyNumber = data.Result.PolicyNo
          this.sumInsured = data.Result.SumInsured
          this.limitOfLiability = data.Result.LimitsOfLiability
          this.premiumAmount = data.Result.PremiumAmount
          // this.signDay=data.Result.PolicyNo
          // this.signMonth=data.Result.PolicyNo
          // this.signYear=data.Result.PolicyNo
          // this.signYear=data.Result.PolicyNoF
          this.PremiumCurrency = data.Result.PremiumCurrency
          this.PolicyStartDate = data.Result.PolicyStartDate
          this.PolicyEndDate = data.Result.PolicyEndDate
          this.CompanyName = data.Result.CompanyName
          this.FirstName = data.Result.FirstName
        }

      },
      (err: any) => { },
    );
  }
}
