import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KillEventComponent } from './kill-event.component';

describe('KillEventComponent', () => {
  let component: KillEventComponent;
  let fixture: ComponentFixture<KillEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KillEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KillEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
