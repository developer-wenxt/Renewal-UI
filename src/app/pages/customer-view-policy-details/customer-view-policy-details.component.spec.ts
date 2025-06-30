import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerViewPolicyDetailsComponent } from './customer-view-policy-details.component';

describe('CustomerViewPolicyDetailsComponent', () => {
  let component: CustomerViewPolicyDetailsComponent;
  let fixture: ComponentFixture<CustomerViewPolicyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerViewPolicyDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerViewPolicyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
