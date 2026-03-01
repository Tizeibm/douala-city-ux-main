import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrerStructuresComponent } from './filtrer-structures.component';

describe('FiltrerStructuresComponent', () => {
  let component: FiltrerStructuresComponent;
  let fixture: ComponentFixture<FiltrerStructuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltrerStructuresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrerStructuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
