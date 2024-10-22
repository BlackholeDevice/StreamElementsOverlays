import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NavigatorService} from '../../navigator.service';

@Injectable()
export class ContentRetrieverService {
  private http = inject(HttpClient);
  private navigator = inject(NavigatorService);

  public fetchAndCopy(url: string): void {
    this.http.get(url, {responseType: 'text'}).subscribe(content => {
      this.navigator.copy(content as string)
    });
  }
}
