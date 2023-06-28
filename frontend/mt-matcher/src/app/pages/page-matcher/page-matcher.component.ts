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

  moneyAmount = 0;

  calculateProfitLoss(trade: any, moneyAmount: any): number {
    return (
      -(trade.broker_1_valore_del_pip + trade.boroker_2_valore_del_pip) *
      moneyAmount
    );
  }

  calculateSpreadBroker1(trade: any, moneyAmount: any): number {
    return trade.broker_1_valore_del_pip * moneyAmount;
  }

  calculateSpreadBroker2(trade: any, moneyAmount: any): number {
    return trade.boroker_2_valore_del_pip * moneyAmount;
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
}
