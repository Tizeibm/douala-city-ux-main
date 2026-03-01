import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcolesComponent } from './ecoles.component';

describe('EcolesComponent', () => {
  let component: EcolesComponent;
  let fixture: ComponentFixture<EcolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EcolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
