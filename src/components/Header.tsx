import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  Wallet, 
  PlusCircle, 
  ExternalLink, 
  Code2, 
  CheckCircle2, 
  ChevronDown, ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { WalletAccount } from '../types/hedera';
import { formatHbar } from '../utils/crypto';

interface HeaderProps {
  wallet: WalletAccount;
  onFaucet: () => void;
  onSelectAccount: (accountId: string) => void;
  onOpenExplorer: (detail: any) => void;
  onOpenDocs: () => void;
  onConnectMetaMask?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onFaucet,
  onSelectAccount,
  onOpenExplorer,
  onOpenDocs,
  onConnectMetaMask,
}) => {
  
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (showAccountDropdown && wallet.walletProvider === 'MetaMask') {
      const fetchTx = async () => {
        setTxLoading(true);
        try {
          const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/transactions?account.id=${wallet.accountId}&limit=4`);
          if (res.ok) {
            const data = await res.json();
            setTxHistory(data.transactions || []);
          }
        } catch (e) {
          console.error(e);
        }
        setTxLoading(false);
      };
      fetchTx();
    }
  }, [showAccountDropdown, wallet.accountId, wallet.walletProvider]);

  const [faucetLoading, setFaucetLoading] = useState(false);

  const sampleAccounts = [
    { id: '0.0.482910', alias: 'EnterpriseDev.hbar', defaultHbar: 125.5 },
    { id: '0.0.109284', alias: 'EnterpriseAuditor.hbar', defaultHbar: 580.0 },
    { id: '0.0.992817', alias: 'ZeroBalanceNewbie.hbar', defaultHbar: 0.05 },
  ];

  const handleFaucetClick = () => {
    setFaucetLoading(true);
    setTimeout(() => {
      onFaucet();
      setFaucetLoading(false);
    }, 450);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#020617]/90 backdrop-blur-md">
      {/* Top telemetry ticker */}
      <div className="border-b border-slate-800/50 bg-slate-950/70 px-4 py-1 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Hedera Testnet: Operational</span>
            </span>
            <span className="hidden text-slate-500 md:inline">|</span>
            <span className="hidden items-center space-x-1 text-slate-400 sm:flex">
              <Activity className="h-3 w-3 text-blue-400" />
              <span>Consenso aBFT Latency:</span>
              <strong className="text-blue-300 font-mono">~3.2s</strong>
            </span>
            <span className="hidden text-slate-500 lg:inline">|</span>
            <span className="hidden items-center space-x-1 text-slate-400 lg:flex">
              <span className="text-slate-400">Fixed USD Fee:</span>
              <strong className="text-slate-200 font-mono">$0.0001 / tx</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <button
              onClick={onOpenDocs}
              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Scaffold Arch & Docs</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => onOpenExplorer({
                title: 'Hedera Testnet Mirror Node Overview',
                type: 'ACCOUNT',
                id: wallet.accountId,
                payerAccountId: wallet.accountId,
                nodeAccountId: '0.0.3 (Hedera Node)',
                status: 'SUCCESS',
              })}
              className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>HashScan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand logo & tagline */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Layers className="h-5 w-5 text-emerald-400" />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-black">
              ℏ
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
                SCAFFOLD<span className="text-emerald-400">-HBAR</span>
              </h1>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                Multiverse Kit
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Hedera Hashgraph Next-Gen Full-Stack Starter Template
            </p>
          </div>
        </div>

        {/* Right side controls: Faucet + Balance + Wallet */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Faucet button */}
          <button
            onClick={handleFaucetClick}
            disabled={faucetLoading}
            className="flex items-center space-x-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-medium text-emerald-300 transition-all hover:border-emerald-400 hover:bg-emerald-900/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:opacity-50"
            title="Recargar 50 HBAR de la Testnet"
          >
            <PlusCircle className={`h-3.5 w-3.5 text-emerald-400 ${faucetLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Faucet</span>
            <span className="font-mono text-emerald-200">+50 ℏ</span>
          </button>

          {/* Account Balance display */}
          <div className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 shadow-inner">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
              ℏ
            </span>
            <div className="text-right">
              <div className="font-mono text-xs sm:text-sm font-semibold text-white">
                {formatHbar(wallet.hbarBalance)} <span className="text-emerald-400 text-xs">HBAR</span>
              </div>
            </div>
          </div>

          
          {/* Metamask Button */}
          {onConnectMetaMask && (
            <button
              onClick={onConnectMetaMask}
              className="flex items-center space-x-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 px-2.5 py-1.5 text-xs font-medium text-orange-400 transition-all hover:bg-orange-500/20 hover:border-orange-500/50"
            >
              <svg viewBox="0 0 111 36" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M109.1 0H1.9C.9 0 0 .9 0 1.9v32.2c0 1 .9 1.9 1.9 1.9h107.2c1 0 1.9-.9 1.9-1.9V1.9C111 .9 110.1 0 109.1 0zm-8.6 28.5c-.7 0-1.2-.6-1.2-1.3v-4.5c0-.4-.3-.7-.7-.7H92v5.2c0 .7-.6 1.3-1.3 1.3H88c-.7 0-1.3-.6-1.3-1.3V10.2c0-.7.6-1.3 1.3-1.3h2.7c.7 0 1.3.6 1.3 1.3v5.2h6.7V10.2c0-.7.6-1.3 1.3-1.3h2.7c.7 0 1.3.6 1.3 1.3v17c0 .7-.5 1.3-1.2 1.3h-2.3zM16.5 28.5H12l-4-15v13.6c0 .8-.6 1.4-1.4 1.4H4.3c-.8 0-1.4-.6-1.4-1.4V9.6c0-.8.6-1.4 1.4-1.4h3.7c.5 0 .9.3 1.2.7l4.3 14 4.3-14c.2-.5.7-.7 1.2-.7h3.7c.8 0 1.4.6 1.4 1.4v17.5c0 .8-.6 1.4-1.4 1.4h-2.3c-.7 0-1.3-.6-1.3-1.4V13.5l-3.9 15z"/></svg>
              <span className="hidden sm:inline">Connect Meta</span>
            </button>
          )}

          {/* Account / Wallet Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:border-blue-500/50 hover:bg-slate-800"
            >
              <Wallet className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-mono font-medium hidden md:inline">{wallet.accountId}</span>
              <span className="font-mono font-medium md:hidden">{wallet.accountId.slice(0, 7)}..</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Simulador de Billeteras Hedera
                </div>
                <div className="space-y-1">
                  {sampleAccounts.map(acc => {
                    const isSelected = acc.id === wallet.accountId;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          onSelectAccount(acc.id);
                          setShowAccountDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-medium flex items-center space-x-1">
                            <span>{acc.id}</span>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          </div>
                          <div className="text-[10px] text-slate-400">{acc.alias}</div>
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {acc.id === wallet.accountId ? formatHbar(wallet.hbarBalance) : acc.defaultHbar} ℏ
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-2 border-t border-slate-800 pt-2 px-2 text-[10px] text-slate-500">
                  Conectado vía: <span className="text-slate-300">{wallet.walletProvider} (Testnet)</span>
                </div>

                {/* Historial de Movimientos Real */}
                {wallet.walletProvider === 'MetaMask' && (
                  <div className="mt-2 border-t border-slate-800 pt-2">
                    <div className="px-2 pb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                      <Activity className="h-3 w-3 text-emerald-400" />
                      <span>Movimientos Recientes</span>
                    </div>
                    {txLoading ? (
                      <div className="px-2 py-2 text-xs text-slate-500 text-center animate-pulse">Cargando blockchain...</div>
                    ) : txHistory.length > 0 ? (
                      <div className="space-y-1 px-1">
                        {txHistory.map(tx => {
                          // Buscar si recibio o envio HBAR
                          const myTransfer = tx.transfers?.find((t: any) => t.account === wallet.accountId);
                          const amount = myTransfer ? (myTransfer.amount / 100000000).toFixed(2) : '0.00';
                          const isPositive = myTransfer && myTransfer.amount > 0;
                          return (
                            <a
                              key={tx.transaction_id}
                              href={`https://hashscan.io/testnet/transaction/${tx.transaction_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between rounded p-1.5 hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                {isPositive ? (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"><ChevronDown className="h-3 w-3" /></div>
                                ) : (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-400"><ChevronRight className="h-3 w-3" /></div>
                                )}
                                <span className="text-[10px] text-slate-300 font-mono truncate w-24">{tx.transaction_id.split('-')[0]}</span>
                              </div>
                              <span className={`text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {isPositive ? '+' : ''}{amount} ℏ
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-2 py-2 text-xs text-slate-500 text-center">No hay movimientos recientes</div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
