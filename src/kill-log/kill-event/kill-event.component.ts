import {Component, input} from '@angular/core';
import {KillEvent} from '../kill-event.model';
import {
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-kill-event',
  templateUrl: './kill-event.component.html',
  styleUrl: './kill-event.component.scss',
  standalone: true,
  imports: [
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIcon,
    MatIconButton
  ]
})
export class KillEventComponent {
  public event = input.required<KillEvent>();
}
