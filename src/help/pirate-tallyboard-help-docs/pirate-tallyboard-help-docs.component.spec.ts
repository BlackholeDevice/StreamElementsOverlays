import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PirateTallyboardHelpDocsComponent} from './pirate-tallyboard-help-docs.component';

describe('PirateTallyboardHelpDocsComponent', () => {
  let component: PirateTallyboardHelpDocsComponent;
  let fixture: ComponentFixture<PirateTallyboardHelpDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PirateTallyboardHelpDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PirateTallyboardHelpDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
