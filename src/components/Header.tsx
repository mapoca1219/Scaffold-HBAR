import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  Wallet, 
  PlusCircle, 
  ExternalLink, 
  Code2, 
  CheckCircle2, 
  ChevronDown,
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
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onFaucet,
  onSelectAccount,
  onOpenExplorer,
  onOpenDocs,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
