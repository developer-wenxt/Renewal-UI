import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBusinessCustomerDetailsComponent } from './new-business-customer-details.component';

describe('NewBusinessCustomerDetailsComponent', () => {
  let component: NewBusinessCustomerDetailsComponent;
  let fixture: ComponentFixture<NewBusinessCustomerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewBusinessCustomerDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBusinessCustomerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
