import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditStructureComponent } from './user-edit-structure.component';

describe('UserEditStructureComponent', () => {
  let component: UserEditStructureComponent;
  let fixture: ComponentFixture<UserEditStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserEditStructureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEditStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
