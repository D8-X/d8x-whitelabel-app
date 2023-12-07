import { BrokerTool, ExchangeInfo, TraderInterface } from "@d8x/perpetuals-sdk";
import { atom } from "jotai";

export const traderAPIAtom = atom<TraderInterface | undefined>(undefined);
export const brokerToolAtom = atom<BrokerTool | undefined>(undefined);
export const exchangeInfoAtom = atom<ExchangeInfo | undefined>(undefined);
