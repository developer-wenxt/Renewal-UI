import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBusinessProductsComponent } from './new-business-products.component';

describe('NewBusinessProductsComponent', () => {
  let component: NewBusinessProductsComponent;
  let fixture: ComponentFixture<NewBusinessProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewBusinessProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBusinessProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
