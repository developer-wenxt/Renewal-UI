import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimProductWiseCountComponent } from './claim-product-wise-count.component';

describe('ClaimProductWiseCountComponent', () => {
  let component: ClaimProductWiseCountComponent;
  let fixture: ComponentFixture<ClaimProductWiseCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClaimProductWiseCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimProductWiseCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
