import {Component, input} from '@angular/core';
import {KillEvent} from '../kill-event.model';

@Component({
  selector: 'app-kill-event',
  templateUrl: './kill-event.component.html',
  styleUrl: './kill-event.component.scss',
  imports: []
})
export class KillEventComponent {
  public event = input.required<KillEvent>();
}
