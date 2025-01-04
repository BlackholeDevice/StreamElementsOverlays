import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {ContentUrlComponent} from '../content-url/content-url.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-kill-feed-help-docs',
  templateUrl: './kill-feed-help-docs.component.html',
  styleUrl: './kill-feed-help-docs.component.scss',
  imports: [MatListModule, MatExpansionModule, MatButtonModule, ContentUrlComponent, RouterLink]
})
export class KillFeedHelpDocsComponent {

}
