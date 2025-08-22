import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimSummaryMonthlypaidProductWiseCountComponent } from './claim-summary-monthlypaid-product-wise-count.component';

describe('ClaimSummaryMonthlypaidProductWiseCountComponent', () => {
  let component: ClaimSummaryMonthlypaidProductWiseCountComponent;
  let fixture: ComponentFixture<ClaimSummaryMonthlypaidProductWiseCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClaimSummaryMonthlypaidProductWiseCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimSummaryMonthlypaidProductWiseCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
