import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {ConnectionConfig, StreamerbotService} from '../streamerbot.service';
import {ActivatedRoute} from '@angular/router';
import {contains, defaults, filter as _filter, flow, lowerCase, orderBy, pick} from 'lodash/fp';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {KillEvent} from './kill-event.model';
import {catchError, debounceTime, filter, interval, throwError} from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {KeyValuePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {KillEventComponent} from './kill-event/kill-event.component';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

interface Filter {
  filter: string,
  showNpcs: boolean,
  sortBy: keyof KillEvent
}

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
    MatIconModule,
    MatCheckboxModule,
    KillEventComponent,
    MatSnackBarModule
  ]
})
export class KillLogComponent implements OnInit {
  private service = inject(StreamerbotService);
  private route = inject(ActivatedRoute);
  private destroyRef$ = inject(DestroyRef);
  private fb = inject(FormBuilder)
  private snackbar = inject(MatSnackBar);
  private readonly cooldown = 1;
  private readonly dupeFix: Record<string, number> = {};
  private readonly options: (obj: any) => ConnectionConfig = flow(
    pick(['host', 'port', 'endpoint', 'subscribe', 'autoReconnect', 'retries', 'scheme'] as (keyof ConnectionConfig)[]),
    defaults({host: '127.0.0.1', port: 8080, endpoint: '/', scheme: 'ws'})
  );
  public form = this.fb.group({
    connection: this.fb.group({
      host: ['127.0.0.1', Validators.required],
      port: [8080, [Validators.required, Validators.min(1), Validators.max(65535)]],
      endpoint: ['/', Validators.required],
      autoReconnect: [false],
      retries: [3],
    }),
    filter: this.fb.group({
      filter: [''],
      sortBy: ['timestamp' as keyof KillEvent, Validators.required],
      showNpcs: [true]
    })
  });
  public readonly sortFields: Record<keyof KillEvent, string> = {
    victim: 'Victim Name',
    attacker: 'Attacker Name',
    using: 'Weapon',
    zone: 'Zone',
    timestamp: 'Time',
    type: 'Damage Type',
  }

  private data = signal([] as KillEvent[]);
  public now = signal(Date.now());
  public failed = signal(false);
  public filter = signal(this.form.value.filter as Filter);
  public filtered = computed<KillEvent[]>(() => {
    const {sortBy, filter, showNpcs} = this.filter();
    const list = this.data();
    return flow(
      _filter(({victim, attacker}: KillEvent) => {
        const filterText = lowerCase(filter || '');
        return !filterText || contains(filterText, lowerCase(victim)) || contains(filterText, lowerCase(attacker));
      }),
      _filter(({victimIsNpc}) => showNpcs || !victimIsNpc),
      orderBy(sortBy as keyof KillEvent, sortBy === 'timestamp' ? 'desc' : "asc")
    )(list) as KillEvent[];
  });
  public connected = computed(() => this.service.connected());

  public ngOnInit(): void {
    const connection = this.options(this.route.snapshot.queryParams);
    this.form.patchValue({connection});
    this.onFormChange();
    this.connect({...this.form.value.connection, autoReconnect: false, retries: 1});
    interval(60000).pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.now.set(Date.now()))
  }

  public connect(config: any): void {
    this.snackbar.dismiss();
    config = this.options(config);
    this.failed.set(false);
    this.service.connect<KillEvent>(config).pipe(
      takeUntilDestroyed(this.destroyRef$),
      filter(({victim}) => !this.isDupe(victim)),
      catchError(err => {
        this.snackbar.open(`Failed to connect to ${config.scheme}://${config.host}:${config.port}${config.endpoint}: ${err.message}`, 'Close', {politeness: 'assertive'});
        return throwError(() => err);
      })

    ).subscribe((event: KillEvent) => this.processEvent(event));
  }

  private processEvent(event: KillEvent): void {
    this.dupeFix[event.victim] = event.timestamp
    this.data.update(list => [event, ...list]);
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

  public relativize(timestamp: number, now: number): string {
    const diff = (now - timestamp)/1000;
    if(diff < 60) {
      return 'a few moments ago'
    } else if (diff < 3600) {
      const minutes = ~~(diff / 60);
      return `${minutes} minute${this.pluralize(minutes)} ago`;
    } else {
      const hours = ~~(diff / 3600);
      return `${~~(diff / 3600)} hour${this.pluralize(hours)} ago`;
    }
  }

  private pluralize(n: number): string {
    return n ==  1 ? '' : 's'
  }

  private onFormChange(): void {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef$),
      debounceTime(500)
    ).subscribe(value => {
      this.filter.set(value.filter as Filter);
    })
  }
}
