import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {StreamerbotService} from '../streamerbot.service';
import {ActivatedRoute} from '@angular/router';
import {StreamerbotClientOptions} from '@streamerbot/client';
import {defaults, flow, pick} from 'lodash/fp';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {KillEvent} from './kill-event.model';
import {filter} from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {JsonPipe, KeyValuePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-kill-log',
  templateUrl: './kill-log.component.html',
  styleUrl: './kill-log.component.scss',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    KeyValuePipe,
    MatButtonModule,
    JsonPipe,
    MatIconModule
  ]
})
export class KillLogComponent implements OnInit {
  private service = inject(StreamerbotService);
  private route = inject(ActivatedRoute);
  private destroyRef$ =  inject(DestroyRef);
  private fb = inject(FormBuilder)
  private readonly cooldown = 1;
  private readonly dupeFix: Record<string, number> = {};
  private readonly options: (obj: any) => Partial<StreamerbotClientOptions> = flow(
    pick(['host', 'port', 'endpoint', 'subscribe']),
    defaults({host: '127.0.0.1', port: 8080, endpoint: '/'})
  );
  public form = this.fb.group({
    host: ['127.0.0.1', Validators.required],
    port: [8080, [Validators.required, Validators.min(1), Validators.max(65535)]],
    endpoint: ['/', Validators.required],
    autoReconnect: [false],
    retries: [3],
    filter: [null],
    sortBy: ['timestamp' as keyof KillEvent, Validators.required],
  });
  public readonly sortFields: Record<keyof KillEvent, string> = {
    victim: 'Victim Name',
    attacker: 'Attacker Name',
    using: 'Weapon',
    zone: 'Zone',
    timestamp: 'Time',
    damageType: 'Damage Type',
  }

  public data = signal([] as KillEvent[]);
  public connected = computed(() => this.service.connected());

  public ngOnInit(): void {
    const config = this.options(this.route.snapshot.queryParams);
    this.form.patchValue(config);
    this.connect(this.route.snapshot.queryParams);
  }

  public connect(config: any): void {
    this.service.connect<KillEvent>(this.options(config)).pipe(
      takeUntilDestroyed(this.destroyRef$),
      filter(({victim}) => !this.isDupe(victim)),
    ).subscribe((event: KillEvent) => {
      this.dupeFix[event.victim] = event.timestamp
      this.data.update(list => {
        list.push(event);
        return list;
      })
    });
  }

  public disconnect(): void {
    this.service.disconnect();
  }

  public remove(index: number): boolean {
    this.data.update(list => {
      list.splice(index, 1);
      return list;
    });
    return false;
  }

  private isDupe(key: string): boolean {
    return Boolean(this.dupeFix[key]) && (Date.now() - this.dupeFix[key] <= this.cooldown);
  }

  public clear(): void {
    this.data.set([]);
  }
}
