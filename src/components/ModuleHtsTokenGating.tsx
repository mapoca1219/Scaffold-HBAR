import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Wallet, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight,
  Zap,
  Terminal,
  Database,
  Radio,
  Copy,
  Check,
  Cpu
} from 'lucide-react';
import { WalletAccount } from '../types/hedera';
import { truncateHash, generateHederaConsensusTimestamp, generateTransactionId } from '../utils/crypto';

interface ModuleHtsTokenGatingProps {
  wallet: WalletAccount;
  onUpdateWalletTokens: (tokens: WalletAccount['tokens']) => void;
  onOpenExplorer: (detail: any) => void;
  onNewNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
}

const VIP_TOKEN_ID = '0.0.781294';
const VIP_TOKEN_NAME = 'Hedera AccessPass VIP';
const VIP_TOKEN_SYMBOL = 'ACCESS-VIP';

export const ModuleHtsTokenGating: React.FC<ModuleHtsTokenGatingProps> = ({
  wallet,
  onUpdateWalletTokens,
  onOpenExplorer,
  onNewNotification,
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState<string>('');
  const [isCheckingMirror, setIsCheckingMirror] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check if wallet has VIP token
  const vipToken = wallet.tokens.find(t => t.tokenId === VIP_TOKEN_ID);
  const vipBalance = vipToken ? vipToken.balance : 0;
  const hasAccess = vipBalance > 0;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Simulates querying the Hedera Mirror Node REST endpoint
  const handleQueryMirrorNode = async () => {
    setIsCheckingMirror(true);
    await new Promise(r => setTimeout(r, 650));
    setIsCheckingMirror(false);
    onNewNotification(
      'Consulta al Mirror Node Completada',
      `Endpoint /api/v1/accounts/${wallet.accountId}/tokens respondió en 84ms con balance: ${vipBalance} ${VIP_TOKEN_SYMBOL}`,
      'info'
    );
  };

  // Mint VIP Access Pass
  const handleMintPass = async () => {
    setIsMinting(true);
    try {
      setMintStep('1/3: Asociando Token HTS a la cuenta (TokenAssociateTransaction)...');
      await new Promise(r => setTimeout(r, 750));

      setMintStep('2/3: Acuñando NFT de membresía en Hedera Testnet (TokenMintTransaction)...');
      await new Promise(r => setTimeout(r, 850));

      setMintStep('3/3: Transfiriendo token a cuenta ' + wallet.accountId + '...');
      await new Promise(r => setTimeout(r, 650));

      // Update wallet state
      const existing = wallet.tokens.filter(t => t.tokenId !== VIP_TOKEN_ID);
      const updatedTokens = [
        ...existing,
        {
          tokenId: VIP_TOKEN_ID,
          tokenName: VIP_TOKEN_NAME,
          symbol: VIP_TOKEN_SYMBOL,
          balance: 1,
          decimals: 0,
        },
      ];
      onUpdateWalletTokens(updatedTokens);

      onNewNotification(
        '¡Pase HTS VIP Minteado con Éxito!',
        `Token ID ${VIP_TOKEN_ID} transferido a tu billetera. Acceso concedido al área VIP.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      onNewNotification('Error al mintear token', 'La transacción no pudo completarse.', 'error');
    } finally {
      setIsMinting(false);
      setMintStep('');
    }
  };

  // Burn / Revoke Pass to test access denial again
  const handleRevokePass = () => {
    const updatedTokens = wallet.tokens.filter(t => t.tokenId !== VIP_TOKEN_ID);
    onUpdateWalletTokens(updatedTokens);
    onNewNotification(
      'Pase VIP Transferido / Revocado',
      'Tu saldo ahora es 0. El motor de Token-Gating ha bloqueado el acceso de nuevo.',
      'info'
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-purple-950/30 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display text-lg font-bold text-white">
                  MÓDULO 2: HTS Token-Gating Engine
                </h2>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-300 border border-blue-500/30">
                  Zero-Smart-Contract Auth
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autenticación y control de acceso nativo mediante Hedera Token Service (HTS). Cero costo de gas EVM y verificación en &lt;100ms.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!hasAccess ? (
              <button
                onClick={handleMintPass}
                disabled={isMinting}
                className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-colors shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Simular Minteo Rápido</span>
              </button>
            ) : (
              <button
                onClick={handleRevokePass}
                className="flex items-center space-x-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition-colors shadow-sm"
              >
                <Lock className="h-3.5 w-3.5 text-rose-400" />
                <span>Simular Bloqueo (Saldo 0)</span>
              </button>
            )}
            <button
              onClick={handleQueryMirrorNode}
              disabled={isCheckingMirror}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-300 hover:border-blue-500/40 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-blue-400 ${isCheckingMirror ? 'animate-spin' : ''}`} />
              <span>Consultar Mirror Node</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Status & Wallet Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Wallet state & Gate verification (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Account status card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Billetera Conectada
                </span>
              </div>
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                {wallet.walletProvider}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Account ID:</span>
                <span className="font-mono text-white font-bold">{wallet.accountId}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Balance HBAR:</span>
                <span className="font-mono text-emerald-400 font-semibold">{wallet.hbarBalance.toFixed(2)} ℏ</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Token Requerido:</span>
                <div className="text-right">
                  <div className="font-mono text-blue-300 font-semibold">{VIP_TOKEN_ID}</div>
                  <div className="text-[10px] text-slate-500 font-mono">({VIP_TOKEN_SYMBOL})</div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Balance de Membresía:</span>
                <span className={`font-mono font-bold text-sm ${hasAccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {vipBalance} {VIP_TOKEN_SYMBOL}
                </span>
              </div>
            </div>

            {/* Mirror Node Endpoint Callout */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-3 space-y-1 text-xs">
              <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
                <span>Mirror Node REST Query</span>
                <span className="text-emerald-400 font-bold">200 OK</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 truncate">
                GET /api/v1/accounts/{wallet.accountId}/tokens?token.id={VIP_TOKEN_ID}
              </div>
            </div>

            {/* Action buttons based on access */}
            {!hasAccess ? (
              <button
                onClick={handleMintPass}
                disabled={isMinting}
                className={`w-full relative overflow-hidden rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all flex items-center justify-center space-x-2 ${
                  isMinting
                    ? 'bg-blue-400/50 cursor-not-allowed text-slate-900'
                    : 'bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.99]'
                }`}
              >
                {isMinting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    <span className="font-mono text-[11px]">{mintStep || 'Procesando en Hedera...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Mintear Pase de Acceso (HTS Token)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() =>
                    onOpenExplorer({
                      title: `Token HTS: ${VIP_TOKEN_NAME}`,
                      type: 'TOKEN',
                      id: VIP_TOKEN_ID,
                      payerAccountId: wallet.accountId,
                      nodeAccountId: '0.0.3 (Hedera Node)',
                      status: 'SUCCESS',
                      memo: 'HTS VIP MEMBERSHIP CREDENTIAL',
                    })
                  }
                  className="w-full flex items-center justify-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Inspeccionar Token en HashScan</span>
                </button>

                <button
                  onClick={handleRevokePass}
                  className="w-full text-center text-xs text-slate-500 hover:text-rose-400 transition-colors py-1"
                >
                  [Simular Transferencia o Quema para Probar Bloqueo]
                </button>
              </div>
            )}
          </div>

          {/* Architectural explanation box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span>¿Por qué Zero-Smart-Contract Auth?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              En blockchains tradicionales, verificar un token requiere ejecutar código en la EVM o pagar gas. En <strong>Hedera Hashgraph</strong>, el <strong>Hedera Token Service (HTS)</strong> mantiene los saldos a nivel de capa base nativa.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
              <div className="rounded bg-slate-950 p-2 border border-slate-800 text-slate-300">
                <span className="text-emerald-400">Sin Gas EVM:</span> $0.00
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800 text-slate-300">
                <span className="text-blue-400">Mirror Query:</span> &lt;100ms
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Dynamic Gate Status & Exclusive Content (7 cols) */}
        <div className="lg:col-span-7">
          {!hasAccess ? (
            /* ACCESS DENIED STATE */
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-slate-900/90 to-slate-950 p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[440px] space-y-4 shadow-[0_0_35px_rgba(244,63,94,0.1)] animate-in fade-in duration-300">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
                  <Lock className="h-10 w-10 animate-pulse" />
                </div>
                <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white font-bold shadow-lg">
                  ✕
                </span>
              </div>

              <div>
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase text-rose-400 border border-rose-500/30">
                  ESTADO: ACCESO DENEGADO
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-2">
                  Portal VIP Restringido
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                  Tu billetera <strong>{wallet.accountId}</strong> no posee el token HTS de membresía requerida (<strong>{VIP_TOKEN_ID}</strong>). Las credenciales VIP y telemetría de alta frecuencia están bloqueadas.
                </p>
              </div>

              <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Requisito de Token:</span>
                  <span className="font-mono text-white font-bold">{VIP_TOKEN_NAME}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Balance detectado:</span>
                  <span className="font-mono text-rose-400 font-bold">0.00 {VIP_TOKEN_SYMBOL}</span>
                </div>
              </div>

              <button
                onClick={handleMintPass}
                disabled={isMinting}
                className="rounded-xl bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Mintear Pase VIP para Desbloquear</span>
              </button>
            </div>
          ) : (
            /* ACCESS GRANTED STATE - VIP EXCLUSIVE TERMINAL */
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/90 to-slate-950 p-6 space-y-5 shadow-[0_0_35px_rgba(16,185,129,0.15)] animate-in fade-in duration-300">
              {/* Access Granted Badge Banner */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                    <Unlock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-300 border border-emerald-500/30">
                        ACCESO CONCEDIDO
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">100% Verificado</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mt-1">
                      AccessPass VIP Terminal Desbloqueada
                    </h3>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">HTS Token Balance</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">1.00 {VIP_TOKEN_SYMBOL}</span>
                </div>
              </div>

              {/* VIP Card Content 1: Live Alpha Oracle Feeds */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span>Feeds Exclusivos Hedera Alpha (Pyth Oracles & DeFi)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Stream en vivo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <div className="text-slate-400 text-[11px]">HBAR / USD (Pyth Network)</div>
                    <div className="mt-1 font-mono text-base font-bold text-emerald-400">$0.0814</div>
                    <div className="text-[10px] text-emerald-500 font-mono">+4.82% (24h)</div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <div className="text-slate-400 text-[11px]">SaucerSwap V2 TVL</div>
                    <div className="mt-1 font-mono text-base font-bold text-blue-400">$48.29M</div>
                    <div className="text-[10px] text-slate-400 font-mono">HBAR/USDC Pool #1</div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <div className="text-slate-400 text-[11px]">Hedera TPS en Vivo</div>
                    <div className="mt-1 font-mono text-base font-bold text-purple-400">1,842 TPS</div>
                    <div className="text-[10px] text-purple-300 font-mono">Consenso Real aBFT</div>
                  </div>
                </div>
              </div>

              {/* VIP Card Content 2: Enterprise Devnet API Key */}
              <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                  <span className="flex items-center space-x-1.5">
                    <Key className="h-4 w-4 text-purple-400" />
                    <span>Master Devnet Secret Key (Gated Endpoint)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard('hbar_live_sec_99a812bf9830da01e82847c1', 'api_key')}
                    className="flex items-center space-x-1 text-[11px] text-purple-300 hover:text-white"
                  >
                    {copiedKey === 'api_key' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'api_key' ? 'Copiado' : 'Copiar Key'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-purple-200/90 break-all bg-slate-950/90 p-2.5 rounded-lg border border-purple-500/20">
                  hbar_live_sec_99a812bf9830da01e82847c1
                </div>
                <p className="text-[11px] text-slate-400">
                  Este token HTS autoriza el acceso a la API gRPC de baja latencia reservada para partners institucionales de Hedera.
                </p>
              </div>

              {/* VIP Card Content 3: Quick Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="text-slate-400 text-[11px] flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Validado mediante Hedera Token Service v2</span>
                </div>
                <button
                  onClick={handleRevokePass}
                  className="text-rose-400 hover:underline text-[11px]"
                >
                  Revocar Pase para Probar Bloqueo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
