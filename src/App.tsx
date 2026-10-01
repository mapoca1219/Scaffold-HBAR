import { fetchLiveBalance } from "./utils/liveHedera";
import { transferTestnetHbar } from "./services/hederaService";
import React, { useState } from 'react';
import { 
  Bot, 
  Key, 
  Database, 
  Sparkles, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X,
  ExternalLink,
  Layers,
  Activity,
  Cpu,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { WalletAccount, HashScanDetail } from './types/hedera';
import { Header } from './components/Header';
import { ModuleAiPayPerQuery } from './components/ModuleAiPayPerQuery';
import { ModuleHtsTokenGating } from './components/ModuleHtsTokenGating';
import { ModuleAuditTrail } from './components/ModuleAuditTrail';
import { HashScanModal } from './components/HashScanModal';
import { DeveloperDocsModal } from './components/DeveloperDocsModal';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error';
  timestamp: number;
}

export default function App() {
  // Current active module tab
  const [activeTab, setActiveTab] = useState<'ai_pay' | 'hts_gate' | 'audit_trail'>('ai_pay');

  // Simulated connected wallet account


  const [wallet, setWallet] = useState<WalletAccount>({
    accountId: '0.0.482910',
    alias: 'Developer.hbar',
    hbarBalance: 142.85,
    tokens: [
      {
        tokenId: '0.0.781294',
        tokenName: 'Hedera AccessPass VIP',
        symbol: 'ACCESS-VIP',
        balance: 0, // Starts at 0 so user can see "ACCESO DENEGADO" and click "Mintear Pase"
        decimals: 0,
      },
      {
        tokenId: '0.0.456123',
        tokenName: 'Testnet USD Coin',
        symbol: 'USDC',
        balance: 1250,
        decimals: 6,
      },
    ],
    walletProvider: 'HashPack',
    connected: true,
  });


  
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const loadLiveBalance = async () => {
      if (wallet.accountId === '0.0.992817' || wallet.accountId === '0.0.109284') return;
      
      const liveBalance = await fetchLiveBalance(wallet.accountId);
      if (liveBalance !== null) {
        setWallet(prev => {
          // Only update state if the balance actually changed to avoid unnecessary re-renders
          if (prev.hbarBalance !== liveBalance) {
            return { ...prev, hbarBalance: liveBalance, alias: prev.walletProvider === 'MetaMask' ? 'MetaMask.eth' : 'LiveTestnet.hbar' };
          }
          return prev;
        });
      }
    };

    // Load immediately on mount or account change
    loadLiveBalance();

    // Set up polling every 5 seconds for real-time updates
    if (wallet.walletProvider === 'MetaMask' || wallet.accountId === '0.0.2') {
      intervalId = setInterval(loadLiveBalance, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [wallet.accountId, wallet.walletProvider]);



  // Modal states
  const [explorerDetail, setExplorerDetail] = useState<HashScanDetail | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Toast notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'error') => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setNotifications(prev => [{ id, title, message, type, timestamp: Date.now() }, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  const connectMetaMask = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const evmAddress = accounts[0];
          // Fetch from mirror node
          const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${evmAddress}`);
          let hederaId = evmAddress;
          let balance = 0;
          if (response.ok) {
            const data = await response.json();
            hederaId = data.account;
            balance = data.balance.balance / 100_000_000;
          }
          
          setWallet({
            accountId: hederaId,
            alias: 'MetaMask.eth',
            hbarBalance: balance,
            tokens: [{
              tokenId: '0.0.781294',
              tokenName: 'Hedera AccessPass VIP',
              symbol: 'ACCESS-VIP',
              balance: 0,
              decimals: 0,
            }],
            walletProvider: 'MetaMask',
            connected: true,
          });
          
          addNotification('MetaMask Conectado', `Billetera en vivo: ${hederaId}`, 'success');
        }
      } catch (error) {
        addNotification('Error de MetaMask', 'No se pudo conectar la billetera.', 'error');
      }
    } else {
      addNotification('MetaMask no encontrado', 'Por favor instala la extensión de MetaMask o un navegador Web3.', 'error');
    }
  };

  // Balance deduction helper
  const handleDeductBalance = (amount: number): boolean => {
    if (wallet.hbarBalance < amount) {
      addNotification('Balance insuficiente', `Saldo requerido: ${amount} HBAR. Saldo actual: ${wallet.hbarBalance.toFixed(2)} HBAR`, 'error');
      return false;
    }
    setWallet(prev => ({
      ...prev,
      hbarBalance: Math.max(0, prev.hbarBalance - amount),
    }));
    return true;
  };

  // Faucet simulation / execution
  const [faucetLoading, setFaucetLoading] = useState(false);

  const handleFaucet = async () => {
    if (wallet.walletProvider === 'MetaMask') {
      const hasTreasury = import.meta.env.VITE_HEDERA_ACCOUNT_ID && import.meta.env.VITE_HEDERA_PRIVATE_KEY;
      
      if (hasTreasury) {
        // Treasury configured! Execute real transfer on testnet
        setFaucetLoading(true);
        const success = await transferTestnetHbar(wallet.accountId, 50);
        setFaucetLoading(false);
        
        if (success) {
          addNotification(
            'Testnet Faucet Exitoso',
            `Transacción completada. Se enviaron 50 HBAR reales a ${wallet.accountId}`,
            'success'
          );
        } else {
          addNotification(
            'Error del Faucet Real',
            'La cuenta del tesoro (.env) no tiene fondos suficientes o la llave es incorrecta.',
            'error'
          );
        }
      } else {
        // No treasury configured, redirect to official portal
        window.open('https://portal.hedera.com/dashboard', '_blank');
        addNotification(
          'Redirigiendo al Faucet Oficial',
          'Aún no configuras tu .env. Usa el portal de Hedera para obtener fondos.',
          'info'
        );
      }
    } else {
      // Simulated wallet
      setWallet(prev => ({
        ...prev,
        hbarBalance: prev.hbarBalance + 50.0,
      }));
      addNotification(
        'Faucet Simulado Exitoso',
        `Se han acreditado 50.00 HBAR a la cuenta ${wallet.accountId}. (Modo Demo)`,
        'success'
      );
    }
  };

  // Account selector
  const handleSelectAccount = (newAccountId: string) => {
    const isNewbie = newAccountId === '0.0.992817';
    const isAuditor = newAccountId === '0.0.109284';

    setWallet(prev => ({
      ...prev,
      accountId: newAccountId,
      alias: isNewbie ? 'ZeroBalanceNewbie.hbar' : isAuditor ? 'EnterpriseAuditor.hbar' : 'Developer.hbar',
      hbarBalance: isNewbie ? 0.05 : isAuditor ? 580.0 : 142.85,
      tokens: [
        {
          tokenId: '0.0.781294',
          tokenName: 'Hedera AccessPass VIP',
          symbol: 'ACCESS-VIP',
          balance: isAuditor ? 1 : 0,
          decimals: 0,
        },
      ],
    }));

    addNotification(
      'Billetera Hedera Cambiada',
      `Cuenta activa: ${newAccountId} (${isNewbie ? 'Nueva cuenta sin token VIP' : isAuditor ? 'Cuenta con Pase VIP' : 'Modo Desarrollador'}).`,
      'info'
    );
  };

  const handleUpdateWalletTokens = (tokens: WalletAccount['tokens']) => {
    setWallet(prev => ({ ...prev, tokens }));
  };

  return (
    <div className="min-h-screen bg-mesh-dark text-slate-100 flex flex-col text-slate-100 min-h-screen selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navigation & Telemetry */}
      <Header
        wallet={wallet}
        onFaucet={handleFaucet}
        onSelectAccount={handleSelectAccount}
        onOpenExplorer={detail => setExplorerDetail(detail)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onConnectMetaMask={connectMetaMask}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Hedera Hashgraph Web3 Starter Kit</span>
                </span>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-300 border border-blue-500/30">
                  Next.js + Tailwind + HTS/HCS
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Scaffold-HBAR <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">Enterprise Suite</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Plantilla de producción interactiva para construir dApps de alta velocidad en Hedera. Experimenta con <strong>micropagos de IA notarizados</strong>, <strong>autenticación Token-Gated sin smart contracts</strong> y un <strong>registro de auditoría empresarial inmutable</strong>.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:min-w-[340px]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-center">
                <div className="text-[10px] uppercase font-mono text-slate-400">Finalidad aBFT</div>
                <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">3.2 seg</div>
                <div className="text-[9px] text-slate-500 font-mono">100% Determinista</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-center">
                <div className="text-[10px] uppercase font-mono text-slate-400">Costo HCS/HTS</div>
                <div className="font-mono text-base font-bold text-blue-400 mt-0.5">$0.0001</div>
                <div className="text-[9px] text-slate-500 font-mono">Fijo en USD</div>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-center">
                <div className="text-[10px] uppercase font-mono text-slate-400">Rendimiento</div>
                <div className="font-mono text-base font-bold text-purple-400 mt-0.5">10,000+</div>
                <div className="text-[9px] text-slate-500 font-mono">TPS Nativo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Interactive Demo Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Guía Rápida de Demostración:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('ai_pay')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeTab === 'ai_pay'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              1. Notarización IA con SHA-256
            </button>

            <button
              onClick={() => setActiveTab('hts_gate')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeTab === 'hts_gate'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              2. Token-Gating (Acceso Denegado / Concedido)
            </button>

            <button
              onClick={() => setActiveTab('audit_trail')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeTab === 'audit_trail'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              3. Auditoría HCS Inmutable
            </button>

            <button
              onClick={() =>
                setExplorerDetail({
                  title: 'Hedera Testnet HashScan // Transacción Demo',
                  type: 'TRANSACTION',
                  id: `${wallet.accountId}@1727712400.198234190`,
                  consensusTimestamp: '1727712400.198234190',
                  payerAccountId: wallet.accountId,
                  nodeAccountId: '0.0.3 (Hedera Node)',
                  status: 'SUCCESS',
                  sequenceNumber: 42,
                  sha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
                  memo: 'HCS-AI-NOTARY // DEMO TRANSACTION',
                  transfers: [
                    { account: wallet.accountId, amount: '-0.05 ℏ' },
                    { account: '0.0.489102 (AI Topic)', amount: '+0.05 ℏ' },
                  ],
                })
              }
              className="rounded-lg bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-900/60 transition-all flex items-center space-x-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Ver HashScan</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-1 rounded-2xl border backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 w-full">
            {/* Tab 1 */}
            <button
              onClick={() => setActiveTab('ai_pay')}
              className={`flex items-center justify-center space-x-2.5 rounded-xl py-3 px-4 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ai_pay'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-300 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Bot className={`h-4 w-4 ${activeTab === 'ai_pay' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>1. AI Pay-Per-Query</span>
              <span className="hidden md:inline rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
                HBAR + HCS
              </span>
            </button>

            {/* Tab 2 */}
            <button
              onClick={() => setActiveTab('hts_gate')}
              className={`flex items-center justify-center space-x-2.5 rounded-xl py-3 px-4 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'hts_gate'
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-300 border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Key className={`h-4 w-4 ${activeTab === 'hts_gate' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>2. HTS Token-Gating</span>
              <span className="hidden md:inline rounded bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-mono text-blue-300">
                Zero-Contract
              </span>
            </button>

            {/* Tab 3 */}
            <button
              onClick={() => setActiveTab('audit_trail')}
              className={`flex items-center justify-center space-x-2.5 rounded-xl py-3 px-4 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'audit_trail'
                  ? 'bg-gradient-to-r from-purple-500/20 to-purple-500/10 text-purple-300 border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Database className={`h-4 w-4 ${activeTab === 'audit_trail' ? 'text-purple-400' : 'text-slate-500'}`} />
              <span>3. Enterprise Audit Trail</span>
              <span className="hidden md:inline rounded bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-mono text-purple-300">
                HCS Notary
              </span>
            </button>
          </div>
        </div>

        {/* Tab Modules Viewport */}
        <div className="transition-all">
          {activeTab === 'ai_pay' && (
            <ModuleAiPayPerQuery
              userBalance={wallet.hbarBalance}
              accountId={wallet.accountId}
              onDeductBalance={handleDeductBalance}
              onOpenExplorer={detail => setExplorerDetail(detail)}
              onNewNotification={addNotification}
            />
          )}

          {activeTab === 'hts_gate' && (
            <ModuleHtsTokenGating
              wallet={wallet}
              onUpdateWalletTokens={handleUpdateWalletTokens}
              onOpenExplorer={detail => setExplorerDetail(detail)}
              onNewNotification={addNotification}
            />
          )}

          {activeTab === 'audit_trail' && (
            <ModuleAuditTrail
              accountId={wallet.accountId}
              userBalance={wallet.hbarBalance}
              onDeductBalance={handleDeductBalance}
              onOpenExplorer={detail => setExplorerDetail(detail)}
              onNewNotification={addNotification}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800 bg-mesh-dark/95 px-4 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-slate-400">
              Scaffold-HBAR Enterprise Suite // Hedera Hashgraph Testnet
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Docs & SDK Snippets</span>
            </button>
            <span>•</span>
            <a
              href="https://docs.hedera.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <span>Hedera Docs</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <a
              href="https://hashscan.io/testnet"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400 transition-colors flex items-center space-x-1"
            >
              <span>HashScan Testnet</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* HashScan Explorer Modal */}
      <HashScanModal
        detail={explorerDetail}
        onClose={() => setExplorerDetail(null)}
      />

      {/* Developer Docs Modal */}
      <DeveloperDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Toast Notifications container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start space-x-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              n.type === 'success'
                ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-200'
                : n.type === 'error'
                ? 'border-rose-500/40 bg-slate-900/95 text-rose-200'
                : 'border-blue-500/40 bg-slate-900/95 text-blue-200'
            }`}
          >
            <div className="mt-0.5">
              {n.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {n.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400" />}
              {n.type === 'info' && <Info className="h-4 w-4 text-blue-400" />}
            </div>

            <div className="flex-1 text-xs">
              <div className="font-semibold text-white">{n.title}</div>
              <div className="mt-0.5 text-slate-300 leading-snug">{n.message}</div>
            </div>

            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
