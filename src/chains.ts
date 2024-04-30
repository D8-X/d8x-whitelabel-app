import { Chain } from 'wagmi/chains';

export const xlayer = {
  id: 196,
  name: 'X Layer',
  network: 'X Layer',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  rpcUrls: {
    public: { http: ['https://rpc.xlayer.tech'] },
    default: { http: ['https://rpc.xlayer.tech'] },
  },
  blockExplorers: {
    etherscan: { name: 'OKX Explorer', url: 'https://www.okx.com/explorer/xlayer' },
    default: { name: 'OKX Explorer', url: 'https://www.okx.com/explorer/xlayer' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 47416,
    },
  },
} as const satisfies Chain;
