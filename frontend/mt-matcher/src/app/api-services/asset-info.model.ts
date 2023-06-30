export interface AssetInfo {
  asset: string;
  assetId: number;
  leva_margine: number;
  broker_1_nome: string;
  broker_1_Bid: number;
  broker_1_spread: number;
  broker_1_valore_spread_long: number;
  broker_1_valore_spread_short: number;
  broker_1_valore_del_pip: number;
  broker_1_valore_lotto: number;
  broker_2_nome: string;
  broker_2_Bid: number;
  broker_2_spread: number;
  broker_2_valore_spread_long: number;
  broker_2_valore_spread_short: number;
  boroker_2_valore_del_pip: number;
  broker_2_valore_lotto: number;
}
