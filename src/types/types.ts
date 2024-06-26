import { IClientOrder } from "@d8x/perpetuals-sdk/dist/esm/contracts/LimitOrderBook";
import { AlignE } from "./enums";
import { ExchangeInfo as ExchangeInfoSDK } from "@d8x/perpetuals-sdk";

export interface ExchangeInfo extends ExchangeInfoSDK {
  chainId: number;
}
export interface OrderBookPropsI {
  chainId: number;
  perpetualId: number;
}

export interface OrderI extends IClientOrder.ClientOrderStruct {
  id: string;
}

export interface OrderBook {
  symbol: string;
  buy: {
    market: OrderI[];
    limit: OrderI[];
    stopMarket: OrderI[];
    stopLimit: OrderI[];
  };
  sell: {
    market: OrderI[];
    limit: OrderI[];
    stopMarket: OrderI[];
    stopLimit: OrderI[];
  };
}

export interface TableHeaderI {
  label: JSX.Element | string;
  align: AlignE;
}
