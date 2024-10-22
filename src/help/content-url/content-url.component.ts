import { Component, inject, input } from '@angular/core';
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

  public copyContent(): boolean {
    this.service.fetchAndCopy(this.url());
    return false;
  }
}
