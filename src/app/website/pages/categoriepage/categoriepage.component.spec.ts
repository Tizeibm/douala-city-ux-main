import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriepageComponent } from './categoriepage.component';

describe('CategoriepageComponent', () => {
  let component: CategoriepageComponent;
  let fixture: ComponentFixture<CategoriepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoriepageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
