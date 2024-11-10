import {Injectable, signal} from '@angular/core';
import {
  StreamerbotClient,
  StreamerbotClientOptions,
  StreamerbotEventName,
  StreamerbotEventsSubscription
} from '@streamerbot/client';
import {equals, pick} from 'lodash/fp';
import {from, Observable, ReplaySubject} from 'rxjs';

type StreamerbotEventSubscription = StreamerbotEventsSubscription | '*';
export type ConnectionConfig = Partial<StreamerbotClientOptions>

@Injectable({
  providedIn: 'root'
})
export class StreamerbotService {
  private readonly subj = new ReplaySubject();
  private readonly subj$ = this.subj.asObservable().pipe(
    // switchMap(data => {
    //   const error = get('error', data);
    //   if(error) {
    //     return throwError(() => error);
    //   }
    //   return of(data);
    // })
  );
  private client?: StreamerbotClient;
  private config: ConnectionConfig = {};
  public connected = signal(false);

  public connect<T>(config: ConnectionConfig): Observable<T> {
    if (!this.client || !this.equals(config, this.config)) {
      this.client = this.newConnection(config);
    }

    return this.subj$ as Observable<T>;
  }

  public disconnect(): void {
    if(!this.client) {
      return;
    }

    const temp = this.client
    this.client = undefined;

    from(temp.disconnect()).subscribe();
  }

  private equals(l: ConnectionConfig, r: ConnectionConfig): boolean {
    const fields = pick(['host', 'port', 'endpoint', 'scheme'] as (keyof ConnectionConfig)[]);
    return equals(fields(l), fields(r))
  }

  private newConnection(config: ConnectionConfig): StreamerbotClient {
    if(this.client && this.connected()) {
      if(!this.equals(config, this.config)) {
        this.disconnect();
      } else {
        return this.client as StreamerbotClient;
      }
    }

    const subscribe: StreamerbotEventSubscription = config.subscribe || {General: ['Custom']}
    const client = new StreamerbotClient({
      subscribe,
      ...config,
      onConnect: () => this.connected.set(true),
      onDisconnect: () => this.connected.set(false),
      onError: (error) => this.subj.error(error)
    });

    from(client.on(this.subscriptionToEventName(subscribe), ({data}) => {
      this.subj.next({...data, timestamp: new Date(data.timestamp).getTime()});
    })).subscribe();

    return client;
  }


  private subscriptionToEventName(subscription: StreamerbotEventSubscription): StreamerbotEventName {
    let eventName = '*';
    if (subscription !== '*') {
      const [key, [value]] = Object.entries(subscription)[0];
      eventName = [key, value].join('.')
    }
    return eventName as StreamerbotEventName;
  }
}
