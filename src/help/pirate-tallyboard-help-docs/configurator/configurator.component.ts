import {Component, inject} from '@angular/core';
import fields from './fields.json';
import item from './item.json';
import {NavigatorService} from '../../../navigator.service';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {assign, clamp, invoke, template} from 'lodash/fp';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-configurator',
  templateUrl: './configurator.component.html',
  styleUrl: './configurator.component.scss',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule
  ],
  providers: [NavigatorService]
})
export class ConfiguratorComponent {
  private service = inject(NavigatorService);
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<ConfiguratorComponent>);
  private itemTemplate = template(JSON.stringify(item));


  public easyForm = this.fb.group({
    lines: [1, [Validators.required, Validators.min(1)]],
  });

  public detailedForm = this.fb.group({
    fields: this.fb.array([this.newControl], [Validators.minLength(1)])
  });

  public close(): void {
    this.dialogRef.close();
  }

  private copy0() {
    let config = fields;
    const items = this.easyForm.value.lines || 1;
    for (let id = 1; id <= items; id++) {
      config = assign(config, JSON.parse(this.itemTemplate({id, item: `Line ${id}`})));
    }
    this.service.copy(JSON.stringify(config));
  }

  private copy1() {
    let config = fields;
    const items = this.array.value;
    items.forEach((item: string, id: number) => {
      config = assign(config, JSON.parse(this.itemTemplate({id, item: item || `Line ${id}`})));
    });
    this.service.copy(JSON.stringify(config));
  }

  public copy(tabIndex: number | null): boolean {
    invoke(`copy${tabIndex || 0}`, this);
    return false;
  }

  public insert(index?: number): void {
    const control = this.newControl;
    if (!index) {
      index = this.array.length;
    }
    index = clamp(0, this.array.length, index);
    this.array.insert(index, control);
    this.renumber();
  }

  public remove(index: number): void {
    this.array.removeAt(index);
    this.renumber();
  }

  public get array(): FormArray {
    return this.detailedForm?.controls.fields;
  }

  public get newControl(): FormControl {
    return this.fb.control(`Line ${(this.array?.length ?? 0) + 1}`);
  }

  private renumber(): void {
    const v = this.array.value as string[];
    v.forEach((line, i) => {
      if (/^Line \d+$/.test(line.trim())) {
        v[i] = `Line ${i + 1}`;
      }
    });
    this.array.patchValue(v);
  }
}
