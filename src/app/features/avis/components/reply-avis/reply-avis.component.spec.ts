import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyAvisComponent } from './reply-avis.component';

describe('ReplyAvisComponent', () => {
  let component: ReplyAvisComponent;
  let fixture: ComponentFixture<ReplyAvisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReplyAvisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyAvisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
