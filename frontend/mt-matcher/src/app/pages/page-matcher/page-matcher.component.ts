import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AssetInfoService } from '../../api-services/asset-info.service'; // Modifica il percorso per corrispondere al tuo ambiente
import { AssetInfo } from '../../api-services/asset-info.model'; // Modifica il percorso per corrispondere al tuo ambiente
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-page-matcher',
  templateUrl: './page-matcher.component.html',
  styleUrls: ['./page-matcher.component.css'],
})
export class PageMatcherComponent implements OnInit {
  trades: AssetInfo[] = [];
  filteredTrades: AssetInfo[] = [];
  filterBrokerControl = new FormControl();
  filterAssetControl = new FormControl();
  page = 1; // Pagina corrente
  pageSize = 10; // Numero di elementi per pagina

  constructor(private assetInfoService: AssetInfoService) {}

  ngOnInit() {
    // Si sottoscrive a un observable che emette un valore ogni x secondi
    interval(5000) // Imposta l'intervallo in millisecondi, in questo caso 5 secondi
      .pipe(
        startWith(0), // Si avvia immediatamente
        switchMap(() => this.assetInfoService.getAssetInfo()) // Ogni volta che l'observable emette un valore, fa una chiamata API
      )
      .subscribe((data) => {
        this.trades = data;
        this.filteredTrades = data;
      });

    this.filterBrokerControl.valueChanges.subscribe(() => {
      this.filterTrades();
      this.page = 1; // Resetta la pagina corrente quando il filtro cambia
    });

    this.filterAssetControl.valueChanges.subscribe(() => {
      this.filterTrades();
      this.page = 1; // Resetta la pagina corrente quando il filtro cambia
    });
  }

  moneyAmount = 0;

  calculateProfitLoss(trade: any, moneyAmount: any): number {
    // Implementa qui il tuo calcolo specifico del profitto/perdita.
    // Esempio:
    return moneyAmount * trade.weighted_Hedge_Ratio - moneyAmount; // Questo è un esempio, dovrai adattarlo al tuo calcolo specifico
  }

  filterTrades() {
    const filterBroker = this.filterBrokerControl.value;
    const filterAsset = this.filterAssetControl.value;
    this.filteredTrades = this.trades.filter(
      (trade) =>
        (filterBroker
          ? trade.broker_1.toLowerCase().includes(filterBroker.toLowerCase())
          : true) &&
        (filterAsset
          ? trade.asset.toLowerCase().includes(filterAsset.toLowerCase())
          : true)
    );
  }
}
