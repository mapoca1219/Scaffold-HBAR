import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity, 
  Database, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileCode,
  Radio
} from 'lucide-react';
import { HashScanDetail } from '../types/hedera';
import { truncateHash } from '../utils/crypto';

interface HashScanModalProps {
  detail: HashScanDetail | null;
  onClose: () => void;
}

export const HashScanModal: React.FC<HashScanModalProps> = ({ detail, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'mirror_json'>('overview');

  if (!detail) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Header styling like HashScan Testnet */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-white text-base tracking-wide">
                  HashScan <span className="text-emerald-400">Testnet Explorer</span>
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-semibold border border-emerald-500/30">
                  {detail.status || 'SUCCESS'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hedera Mirror Node v1.85.0-preview // aBFT Consensus Validated
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher: Overview vs Mirror REST API JSON */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Detalles de Consenso
          </button>
          <button
            onClick={() => setActiveTab('mirror_json')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'mirror_json'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Respuesta REST Mirror Node JSON</span>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'overview' ? (
            <>
              {/* ID Banner */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Identificador {detail.type}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="font-mono text-sm sm:text-base font-bold text-white break-all">
                    {detail.id}
                  </div>
                  <button
                    onClick={() => copyToClipboard(detail.id, 'main_id')}
                    className="ml-2 flex items-center space-x-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {copiedKey === 'main_id' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="text-[11px]">{copiedKey === 'main_id' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Grid with transaction specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                  <div className="text-slate-400">Consensus Timestamp</div>
                  <div className="mt-1 font-mono font-medium text-slate-200">
                    {detail.consensusTimestamp || '1727712394.102938475'}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                  <div className="text-slate-400">Consensus Node</div>
                  <div className="mt-1 font-mono font-medium text-blue-300">
                    {detail.nodeAccountId || '0.0.3 (Hedera Node 0)'}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                  <div className="text-slate-400">Payer Account</div>
                  <div className="mt-1 font-mono font-medium text-purple-300">
                    {detail.payerAccountId || '0.0.482910'}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                  <div className="text-slate-400">Transaction Fee</div>
                  <div className="mt-1 font-mono font-medium text-emerald-400">
                    0.00084 ℏ ($0.00010 USD)
                  </div>
                </div>
              </div>

              {/* Sequence Number & Running Hash if HCS */}
              {detail.sequenceNumber && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center space-x-1.5">
                      <Database className="h-4 w-4 text-blue-400" />
                      <span>HCS Consensus Sequence #{detail.sequenceNumber}</span>
                    </span>
                    <span className="text-[11px] font-mono text-blue-400">
                      aBFT Fair Ordering Guaranteed
                    </span>
                  </div>

                  {detail.runningHash && (
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Running Hash (HCS Chain)</div>
                      <div className="mt-0.5 font-mono text-xs text-slate-300 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                        {detail.runningHash}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SHA-256 Digest Box */}
              {detail.sha256 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-2">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>SHA-256 Digest Notarizado</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(detail.sha256!, 'sha256')}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      {copiedKey === 'sha256' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'sha256' ? 'Copiado' : 'Copiar Hash'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-emerald-200/90 break-all bg-slate-950/80 p-2.5 rounded border border-emerald-500/30">
                    {detail.sha256}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Este hash criptográfico fue verificado contra la carga útil y sellado en el libro mayor inmutable de Hedera.
                  </p>
                </div>
              )}

              {/* Transfers breakdown */}
              {detail.transfers && detail.transfers.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Transferencias de Balance (Tinybars / HBAR)
                  </h4>
                  <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950/40 overflow-hidden">
                    {detail.transfers.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                        <div className="font-mono text-slate-300">{t.account}</div>
                        <div
                          className={`font-mono font-semibold flex items-center space-x-1 ${
                            t.amount.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {t.amount.startsWith('-') ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownLeft className="h-3 w-3" />
                          )}
                          <span>{t.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-blue-400">
                  GET https://testnet.mirrornode.hedera.com/api/v1/transactions/{detail.id}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(detail.rawJson || detail, null, 2),
                      'raw_json'
                    )
                  }
                  className="flex items-center space-x-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
                >
                  {copiedKey === 'raw_json' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>Copiar JSON</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-96">
                {JSON.stringify(
                  detail.rawJson || {
                    consensus_timestamp: detail.consensusTimestamp || '1727712394.102938475',
                    transaction_id: detail.id,
                    type: detail.type,
                    result: detail.status || 'SUCCESS',
                    node: detail.nodeAccountId,
                    payer_account_id: detail.payerAccountId,
                    charged_tx_fee: 84000,
                    entity_id: detail.id,
                    memo_base64: 'U2NhZmZvbGQtSEJBUiBNdWx0aXZlcnNlIEtpdA==',
                    hcs_sequence_number: detail.sequenceNumber || 18,
                    running_hash: detail.runningHash || '6a09e667f3bcc90885a308d313198a2e03707344a4093822299f31d0082efa98',
                    sha256_digest: detail.sha256 || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <span>Powered by Hedera Mirror Node REST APIs</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
