import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDateWiseCountComponent } from './claim-date-wise-count.component';

describe('ClaimDateWiseCountComponent', () => {
  let component: ClaimDateWiseCountComponent;
  let fixture: ComponentFixture<ClaimDateWiseCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClaimDateWiseCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimDateWiseCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
