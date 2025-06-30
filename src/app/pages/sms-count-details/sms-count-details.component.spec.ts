import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsCountDetailsComponent } from './sms-count-details.component';

describe('SmsCountDetailsComponent', () => {
  let component: SmsCountDetailsComponent;
  let fixture: ComponentFixture<SmsCountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmsCountDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsCountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
