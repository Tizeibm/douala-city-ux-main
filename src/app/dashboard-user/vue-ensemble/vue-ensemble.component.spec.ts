import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VueEnsemble } from './vue-ensemble';

describe('VueEnsemble', () => {
  let component: VueEnsemble;
  let fixture: ComponentFixture<VueEnsemble>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VueEnsemble]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VueEnsemble);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
