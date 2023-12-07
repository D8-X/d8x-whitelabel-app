import { atom } from "jotai";
import { OrderBook } from "../types/types";
import { PerpetualState, PoolState } from "@d8x/perpetuals-sdk";

export const orderBooksAtom = atom<Map<string, OrderBook>>(new Map());

export const poolStateAtom = atom<PoolState | undefined>(undefined);

export const perpetualStateAtom = atom<PerpetualState | undefined>(undefined);

export const selectedPoolSymbolAtom = atom<string>("");

export const d8xTokenAddress = atom<string>("");
