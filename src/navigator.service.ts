import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable()
export class NavigatorService {
  private snackbar = inject(MatSnackBar);

  public copy(data: string): void {
    (async () => {
      await navigator.clipboard.writeText(data);
      this.snackbar.open('Copied to clipboard', undefined, {duration: 3000});
    })();
  }
}
