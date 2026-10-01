export interface WalletAccount {
  accountId: string; // e.g., "0.0.482910"
  alias: string;
  hbarBalance: number;
  tokens: {
    tokenId: string;
    tokenName: string;
    symbol: string;
    balance: number;
    decimals: number;
  }[];
  walletProvider: 'HashPack' | 'Blade' | 'Kabila' | 'MetaMask Snap' | 'MetaMask';
  connected: boolean;
}

export interface HcsAiReceipt {
  transactionId: string;
  topicId: string;
  sequenceNumber: number;
  consensusTimestamp: string;
  runningHash: string;
  queryCostHbar: number;
  sha256Digest: string;
  prompt: string;
  response: string;
}

export interface HcsAuditEvent {
  id: string;
  sequenceNumber: number;
  topicId: string;
  eventType: 'ORDEN_CREADA' | 'CONTROL_CALIDAD' | 'DESPACHADO' | 'AUDITORIA_SEGURIDAD' | 'FIRMA_DIGITAL' | 'PROVEEDOR_VALIDADO';
  entityId: string;
  metadataJson: string;
  submitterAccountId: string;
  consensusTimestamp: string;
  sha256Digest: string;
  status: 'Consensus Confirmed' | 'Pending Consensus';
  feeHbar: number;
}

export interface HashScanDetail {
  title: string;
  type: 'TRANSACTION' | 'TOPIC' | 'TOKEN' | 'ACCOUNT';
  id: string;
  consensusTimestamp?: string;
  status: string;
  memo?: string;
  payerAccountId: string;
  nodeAccountId: string;
  transfers?: {
    account: string;
    amount: string;
  }[];
  sha256?: string;
  runningHash?: string;
  sequenceNumber?: number;
  rawJson?: any;
}
