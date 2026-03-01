import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoisirsComponent } from './loisirs.component';

describe('LoisirsComponent', () => {
  let component: LoisirsComponent;
  let fixture: ComponentFixture<LoisirsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoisirsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoisirsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
