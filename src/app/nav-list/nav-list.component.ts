import {Component, input} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {NavItem} from './nav-item.model';
import {
  MatListItem,
  MatListItemIcon,
  MatListItemLine,
  MatListSubheaderCssMatStyler,
  MatNavList
} from '@angular/material/list';

@Component({
  selector: 'app-nav-list',
  templateUrl: './nav-list.component.html',
  styleUrl: './nav-list.component.scss',
  imports: [RouterModule, MatIconModule, MatListItem, MatListItemIcon, MatListItemLine, MatListSubheaderCssMatStyler, MatNavList]
})
export class NavListComponent {
  public links = input.required<NavItem[]>()
  public category = input.required<string>();
  public routerLinkBase = input.required<string>();
  public expanded = input.required<boolean>();
}
