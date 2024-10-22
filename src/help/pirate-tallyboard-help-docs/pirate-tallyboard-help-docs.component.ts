import {Component, inject} from '@angular/core';
import {ConfiguratorComponent} from './configurator/configurator.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {MatTreeModule} from '@angular/material/tree';
import {MatExpansionModule} from '@angular/material/expansion';
import {ContentUrlComponent} from '../content-url/content-url.component';

@Component({
  selector: 'app-pirate-tallyboard-help-docs',
  templateUrl: './pirate-tallyboard-help-docs.component.html',
  styleUrl: './pirate-tallyboard-help-docs.component.scss',
  standalone: true,
  imports: [ConfiguratorComponent, MatButtonModule, MatIconModule, MatDialogModule, MatListModule, MatTreeModule, MatExpansionModule, ContentUrlComponent]
})
export class PirateTallyboardHelpDocsComponent {
  private dialog = inject(MatDialog);

  public launchConfigurator() {
    this.dialog.open(ConfiguratorComponent, {});
  }
}
