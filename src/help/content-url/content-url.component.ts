import {Component, computed, inject, input} from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { ContentRetrieverService } from './content-retriever.service';
import { NavigatorService } from '../../navigator.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-content-url',
  templateUrl: './content-url.component.html',
  styleUrl: './content-url.component.scss',
  standalone: true,
  imports: [
    MatAnchor,
    MatSnackBarModule,
    MatIconModule
  ],
  providers: [ContentRetrieverService, NavigatorService],
})
export class ContentUrlComponent {
  private service = inject(ContentRetrieverService);
  public url = input('');
  public action = input<'copy' | 'open'>('copy')
  public icon = computed(() => this.action() === 'open' ? 'open_in_new' : 'content_copy');

  public click(): boolean {
    if(this.action() === 'open') {
      window.open(this.url(), '_blank');
      return false;
    }

    this.service.fetchAndCopy(this.url());
    return false;
  }
}
