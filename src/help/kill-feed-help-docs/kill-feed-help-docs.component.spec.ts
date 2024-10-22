import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KillFeedHelpDocsComponent} from './kill-feed-help-docs.component';

describe('KillFeedHelpDocsComponent', () => {
  let component: KillFeedHelpDocsComponent;
  let fixture: ComponentFixture<KillFeedHelpDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KillFeedHelpDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KillFeedHelpDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
