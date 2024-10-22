import {Component, DestroyRef, OnInit, signal} from '@angular/core';
import {ActivationStart, Data, Router, RouterModule} from '@angular/router';
import {distinctUntilChanged, filter, map, shareReplay} from 'rxjs';
import {get, getOr} from 'lodash/fp';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {KeyValuePipe} from '@angular/common';

interface NavItem {
  name: string;
  route: string;
  icon?: string,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, MatSidenavModule, MatToolbarModule, MatListModule, KeyValuePipe]
})
export class AppComponent implements OnInit {
  public readonly overlays = signal<NavItem[]>([
    {name: 'Pirate Tallyboard', route: '/overlays/pirate-tallyboard', icon: 'scoreboard'},
    {name: 'Kill Feed', route: '/overlays/kill-feed', icon: 'list'},
  ]);
  public title = signal('Failed to load')
  public expanded = signal(false);

  constructor(private router: Router, private destroyRef: DestroyRef) {
  }

  public ngOnInit(): void {
    this.router.events.pipe(
        filter(event => event instanceof ActivationStart),
        map(get('snapshot.data')),
        shareReplay(1),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
    ).subscribe((data: Data) => {
      this.title.set([getOr(this.title, 'title', data), get('subtitle', data)].filter(Boolean).join(' – '));
    })
  }

  public toggleExpanded(): void {
    this.expanded.update(e => !e);
  }
}
