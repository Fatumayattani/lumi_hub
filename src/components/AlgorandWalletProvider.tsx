import React, { createContext, useContext, ReactNode } from 'react';
import { WalletProvider, useInitializeProviders, PROVIDER_ID } from '@txnlab/use-wallet';
import * as algosdk from 'algosdk';

interface AlgorandWalletContextType {
  // Context will be provided by the WalletProvider
}

const AlgorandWalletContext = createContext<AlgorandWalletContextType | undefined>(undefined);

interface AlgorandWalletProviderProps {
  children: ReactNode;
}

export default function AlgorandWalletProvider({ children }: AlgorandWalletProviderProps) {
  const providers = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.PERA, clientStatic: true },
      { id: PROVIDER_ID.DEFLY, clientStatic: true },
      { id: PROVIDER_ID.EXODUS, clientStatic: true },
      { id: PROVIDER_ID.KIBISIS, clientStatic: true },
    ],
    nodeConfig: {
      network: 'testnet',
      nodeServer: 'https://testnet-api.algonode.cloud',
      nodePort: undefined,
      nodeToken: undefined
    },
    algosdkStatic: true,
  });

  return (
    <WalletProvider value={providers} algosdk={algosdk}>
      <AlgorandWalletContext.Provider value={{}}>
        {children}
      </AlgorandWalletContext.Provider>
    </WalletProvider>
  );
}

export function useAlgorandWallet() {
  const context = useContext(AlgorandWalletContext);
  if (context === undefined) {
    throw new Error('useAlgorandWallet must be used within an AlgorandWalletProvider');
  }
  return context;
}