import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateWiseCountComponent } from './date-wise-count.component';

describe('DateWiseCountComponent', () => {
  let component: DateWiseCountComponent;
  let fixture: ComponentFixture<DateWiseCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateWiseCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateWiseCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
