import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStructureDetComponent } from './user-structure-det.component';

describe('UserStructureDetComponent', () => {
  let component: UserStructureDetComponent;
  let fixture: ComponentFixture<UserStructureDetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserStructureDetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStructureDetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
