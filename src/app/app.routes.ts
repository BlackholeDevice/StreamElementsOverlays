import {Routes} from '@angular/router';
import {
  PirateTallyboardHelpDocsComponent
} from '../help/pirate-tallyboard-help-docs/pirate-tallyboard-help-docs.component';
import {KillFeedHelpDocsComponent} from '../help/kill-feed-help-docs/kill-feed-help-docs.component';
import {KillLogComponent} from '../kill-log/kill-log.component';

export const routes: Routes = [
  {
    path: 'home',
    pathMatch: 'full',
    redirectTo: '/overlays/pirate-tallyboard',
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
    path: 'utilities',
    children: [
      {
        path: 'kill-log',
        component: KillLogComponent,
        data: {subtitle: 'Kill Log'}
      },
    ],
    data: {title: 'Utilities'}
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/overlays/pirate-tallyboard',
    data: {title: 'Redirecting...'}
  }
];
