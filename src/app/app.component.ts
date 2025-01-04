import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ActivationStart, Data, Router, RouterModule} from '@angular/router';
import {distinctUntilChanged, filter, map, shareReplay} from 'rxjs';
import {get, getOr} from 'lodash/fp';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {NavItem} from './nav-list/nav-item.model';
import {NavListComponent} from './nav-list/nav-list.component';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterModule, MatButtonModule, MatIconModule, MatSidenavModule, MatToolbarModule, MatListModule, NavListComponent]
})
export class AppComponent implements OnInit {
  public readonly overlays = signal<NavItem[]>([
    {name: 'Pirate Tallyboard', route: '/pirate-tallyboard', icon: 'scoreboard'},
    {name: 'Kill Feed', route: '/kill-feed', icon: 'list'},
  ]);
  public readonly utilities = signal<NavItem[]>([
    {name: 'Kill Log', route: '/kill-log', icon: 'list_alt_check'}
  ]);
  public title = signal('Failed to load')
  public expanded = signal(false);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private titleService = inject(Title);

  public ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof ActivationStart),
      map(get('snapshot.data')),
      shareReplay(1),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((data: Data) => {
      this.title.set([getOr(this.title, 'title', data), get('subtitle', data)].filter(Boolean).join(' – '));
      this.titleService.setTitle(this.title());
    })
  }

  public toggleExpanded(): void {
    this.expanded.update(e => !e);
  }
}
