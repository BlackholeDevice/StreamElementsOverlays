import {Injectable} from '@angular/core';
import {
  StreamerbotClient,
  StreamerbotClientOptions,
  StreamerbotEventData,
  StreamerbotEventName,
  StreamerbotEventsSubscription
} from '@streamerbot/client';
import {from, Observable, ReplaySubject, switchMap} from 'rxjs';

@Injectable()
export class StreamerbotService {
  public connect(config: Partial<StreamerbotClientOptions>): Observable<StreamerbotEventData<any>> {
    const subscribe = config.subscribe || {General: ['Custom']}
    const subj = new ReplaySubject();
    const client = new StreamerbotClient({
      subscribe,
      ...config
    });

    return from(client.on(this.subscriptionToEventName(subscribe), ({data}) => {
      subj.next(data);
    })).pipe(switchMap(() => subj.asObservable()));
  }

  private subscriptionToEventName(subscription: StreamerbotEventsSubscription | '*'): StreamerbotEventName {
    return subscription.toString() as StreamerbotEventName;
  }
}
