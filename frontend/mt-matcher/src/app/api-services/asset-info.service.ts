import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssetInfo } from './asset-info.model'; // Modifica il percorso per corrispondere al tuo ambiente

@Injectable({
  providedIn: 'root',
})
export class AssetInfoService {
  private apiUrl = 'http://localhost:8080/calculate';

  constructor(private http: HttpClient) {}

  getAssetInfo(): Observable<AssetInfo[]> {
    return this.http.get<AssetInfo[]>(this.apiUrl);
  }
}
