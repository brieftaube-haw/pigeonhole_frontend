import {Benutzer} from "./chat.service";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export interface Nachricht {
  nachricht: string;
  timestamp: Date;
  sender: Benutzer;
}

@Injectable({
  providedIn: 'root'
})
export class NachrichtService {
  private BaseUrl: String = '/api';

  constructor(private http: HttpClient) {}

  getNachrichtenList(): Observable<Benutzer[]> {
    return this.http.get<Benutzer[]>(this.BaseUrl + `/all`);
  }

}
