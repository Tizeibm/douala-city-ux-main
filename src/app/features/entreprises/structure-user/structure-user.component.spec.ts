import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureUserComponent } from './structure-user.component';

describe('StructureUserComponent', () => {
  let component: StructureUserComponent;
  let fixture: ComponentFixture<StructureUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructureUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
