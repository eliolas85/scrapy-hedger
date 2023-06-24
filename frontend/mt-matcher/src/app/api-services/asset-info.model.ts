export interface AssetInfo {
  asset: string;
  broker_1: string;
  broker_1_Bid: number;
  broker_1_Ask: number;
  broker_1_Spread: number;
  broker_2: string;
  broker_2_Bid: number;
  broker_2_Ask: number;
  broker_2_Spread: number;
  hedge_Ratio: number;
  weighted_Hedge_Ratio: number;
  broker_1_coefficiente: number;
  broker_2_coefficiente: number;
}
