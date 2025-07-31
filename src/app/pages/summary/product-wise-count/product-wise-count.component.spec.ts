import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductWiseCountComponent } from './product-wise-count.component';

describe('ProductWiseCountComponent', () => {
  let component: ProductWiseCountComponent;
  let fixture: ComponentFixture<ProductWiseCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductWiseCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductWiseCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
