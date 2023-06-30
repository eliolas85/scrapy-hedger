import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AssetInfoService } from '../../api-services/asset-info.service';
import { AssetInfo } from '../../api-services/asset-info.model';
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
  page = 1;
  pageSize = 10;

  constructor(private assetInfoService: AssetInfoService) {}

  ngOnInit() {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.assetInfoService.getAssetInfo())
      )
      .subscribe((data) => {
        this.trades = data;
        this.filterTrades(); // Effettua il filtraggio ogni volta che i dati vengono aggiornati
      });

    this.filterBrokerControl.valueChanges.subscribe(() => {
      this.filterTrades();
      this.page = 1;
    });

    this.filterAssetControl.valueChanges.subscribe(() => {
      this.filterTrades();
      this.page = 1;
    });
  }

  moneyAmount = 0.01;

  onInputChange(event: any) {
    if (event.target.value < 0.01) {
      this.moneyAmount = 0.01;
    } else {
      this.moneyAmount = event.target.value;
    }
  }

  calculateProfitLoss(trade: any, moneyAmount: any): number {
    return (
      -(trade.broker_1_valore_spread_long + trade.broker_2_valore_spread_long) *
      moneyAmount
    );
  }

  calculateSpreadBroker1(trade: any, moneyAmount: any): number {
    return trade.broker_1_valore_spread_long * moneyAmount;
  }

  calculateSpreadBroker2(trade: any, moneyAmount: any): number {
    return trade.broker_2_valore_spread_long * moneyAmount;
  }

  calculateMarginBroker1(trade: any, moneyAmount: any): number {
    return (trade.broker_1_valore_lotto / 1) * moneyAmount;
  }

  calculateMarginBroker2(trade: any, moneyAmount: any): number {
    return (trade.broker_2_valore_lotto / 1) * moneyAmount;
  }

  filterTrades() {
    const filterBroker = this.filterBrokerControl.value;
    const filterAsset = this.filterAssetControl.value;
    this.filteredTrades = this.trades.filter(
      (trade) =>
        (filterBroker
          ? trade.broker_1_nome
              .toLowerCase()
              .includes(filterBroker.toLowerCase())
          : true) &&
        (filterAsset
          ? trade.asset.toLowerCase().includes(filterAsset.toLowerCase())
          : true)
    );
  }

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Aggiungi questa funzione al tuo componente
  onSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredTrades.sort((a, b) => {
      const valA = this.calculateProfitLoss(a, this.moneyAmount);
      const valB = this.calculateProfitLoss(b, this.moneyAmount);

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }
}
