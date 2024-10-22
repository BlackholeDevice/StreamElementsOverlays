import {Routes} from '@angular/router';
import {HomeComponent} from '../home/home.component';
import {
  PirateTallyboardHelpDocsComponent
} from '../help/pirate-tallyboard-help-docs/pirate-tallyboard-help-docs.component';
import {KillFeedHelpDocsComponent} from '../help/kill-feed-help-docs/kill-feed-help-docs.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: {title: 'Really long home title'}
  },
  {
    path: 'overlays',
    data: {title: 'Overlays'},
    children: [
      {
        path: 'pirate-tallyboard',
        component: PirateTallyboardHelpDocsComponent,
        data: {subtitle: 'Pirate Tallyboard'}
      },
      {
        path: 'kill-feed',
        component: KillFeedHelpDocsComponent,
        data: {subtitle: 'Kill Feed'}
      }
    ]
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'home',
    data: {title: 'Redirecting...'}
  }
];
