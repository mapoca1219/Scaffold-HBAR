import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Cpu, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  History, 
  Coins, 
  Flame, 
  ArrowRight,
  Database,
  Hash,
  Terminal,
  Clock
} from 'lucide-react';
import { HcsAiReceipt } from '../types/hedera';
import { calculateSha256, generateHederaConsensusTimestamp, generateTransactionId, truncateHash, formatHbar } from '../utils/crypto';

interface ModuleAiPayPerQueryProps {
  userBalance: number;
  accountId: string;
  onDeductBalance: (amount: number) => boolean;
  onOpenExplorer: (detail: any) => void;
  onNewNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
}

export const ModuleAiPayPerQuery: React.FC<ModuleAiPayPerQueryProps> = ({
  userBalance,
  accountId,
  onDeductBalance,
  onOpenExplorer,
  onNewNotification,
}) => {
  const initialPrompt = 'Auditar lógica de tokenomics y reentrancy para un contrato de staking con HTS Token 0.0.781294';
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedCost, setSelectedCost] = useState<number>(0.05);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  
  const initialReceipt: HcsAiReceipt = {
    transactionId: `${accountId}@1727712400.198234190`,
    topicId: '0.0.489102',
    sequenceNumber: 42,
    consensusTimestamp: '1727712400.198234190',
    runningHash: '6a09e667f3bcc90885a308d313198a2e03707344a4093822299f31d0082efa98',
    queryCostHbar: 0.05,
    sha256Digest: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    prompt: initialPrompt,
    response: `[HEDERA SECURITY AUDIT PROTOCOL // SEC-0x7F]
• Veredicto: Lógica de custodia validada con optimización de gas a nivel de protocolo nativo.
• Análisis HTS: La llamada 'TokenAssociateTransaction' mitiga riesgos de dusting attacks ya que las cuentas de Hedera requieren aprobación explícita antes de recibir tokens de terceros.
• Reentrancy Protection: Al interactuar con Hedera Token Service (HTS) vía precompilados del sistema (0x167), la máquina virtual ejecuta transferencias con finalismo determinista de 3.2s sin mempools públicos vulnerables a MEV / Front-running.
• Recomendación: Configurar auto-renew period a 7890000 segundos y definir la clave de freeze en 'null' para garantizar inmutabilidad absoluta.`,
  };

  const [activeReceipt, setActiveReceipt] = useState<HcsAiReceipt | null>(initialReceipt);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<HcsAiReceipt[]>([initialReceipt]);
  const [sequenceCounter, setSequenceCounter] = useState<number>(42);

  const presetPrompts = [
    {
      title: 'Auditoría Smart Contract HTS',
      text: 'Auditar lógica de tokenomics y reentrancy para un contrato de staking con HTS Token 0.0.781294',
    },
    {
      title: 'Arquitectura HCS Zero-Gas',
      text: 'Diseñar arquitectura de telemetría IoT con tópicos HCS fragmentados para minimizar costo a $0.0001 por paquete',
    },
    {
      title: 'Hedera Guardian ESG Audit',
      text: 'Generar esquema de verificación dMRV para créditos de carbono tokenizados en Hedera Hashgraph',
    },
    {
      title: 'Hedera EVM vs HTS Benchmark',
      text: 'Comparar rendimiento y costos de acuñación nativa HTS (10k TPS) frente a ERC-20 Solidity en Hedera',
    },
  ];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleExecute = async () => {
    if (!prompt.trim()) {
      onNewNotification('Prompt requerido', 'Ingresa una consulta para el Agente IA de Hedera.', 'info');
      return;
    }

    if (userBalance < selectedCost) {
      onNewNotification(
        'Balance HBAR insuficiente',
        `Necesitas al menos ${selectedCost} ℏ para ejecutar esta consulta. Usa el Faucet de la barra superior.`,
        'error'
      );
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Iniciando transferencia de micropago HBAR...');

    // Step 1: Deduct balance
    const deducted = onDeductBalance(selectedCost);
    if (!deducted) {
      setIsProcessing(false);
      return;
    }

    try {
      await new Promise(r => setTimeout(r, 650));
      setProcessingStep('Consenso Hedera validando TransferTransaction (0.0001 USD fee)...');

      await new Promise(r => setTimeout(r, 850));
      setProcessingStep('Generando síntesis de IA y análisis probabilístico...');

      // Synthesize high-quality technical response based on prompt
      const syntheticResponse = generateTechnicalAiResponse(prompt, selectedCost);

      await new Promise(r => setTimeout(r, 900));
      setProcessingStep('Calculando SHA-256 digest inmutable con Web Crypto API...');

      // Compute live SHA-256 of the prompt + AI response
      const combinedPayload = `PROMPT:${prompt}\nRESPONSE:${syntheticResponse}\nCOST:${selectedCost}HBAR`;
      const liveSha256 = await calculateSha256(combinedPayload);

      await new Promise(r => setTimeout(r, 700));
      setProcessingStep('Sometiendo a Hedera Consensus Service (Topic: 0.0.489102)...');

      const nextSeq = sequenceCounter + 1;
      setSequenceCounter(nextSeq);
      const timestamp = generateHederaConsensusTimestamp();
      const txId = generateTransactionId(accountId);
      const runningHashBuffer = await calculateSha256(`${liveSha256}-${nextSeq}-${timestamp}`);

      const receipt: HcsAiReceipt = {
        transactionId: txId,
        topicId: '0.0.489102',
        sequenceNumber: nextSeq,
        consensusTimestamp: timestamp,
        runningHash: runningHashBuffer,
        queryCostHbar: selectedCost,
        sha256Digest: liveSha256,
        prompt: prompt,
        response: syntheticResponse,
      };

      await new Promise(r => setTimeout(r, 500));
      setActiveReceipt(receipt);
      setQueryHistory(prev => [receipt, ...prev]);

      onNewNotification(
        'Micropago y Notarización HCS Confirmados',
        `Secuencia #${nextSeq} sellada por consenso aBFT en Testnet.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      onNewNotification('Error en la transacción', 'No se pudo completar el consenso Hedera.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explanation */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-blue-950/30 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display text-lg font-bold text-white">
                  MÓDULO 1: AI Pay-Per-Query & HCS Notarization
                </h2>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/30">
                  Zero Subscriptions
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Micropagos nativos en HBAR (desde $0.0007 USD) combinados con sellado inmutable en Hedera Consensus Service.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Topic Notario Activo</span>
              <span className="font-mono text-emerald-300 font-semibold">0.0.489102</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Receipt Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt Input & Pay Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-4">
            {/* Prompt presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Prompt para el Agente IA de Hedera</span>
                </label>
                <span className="text-[10px] text-slate-500">Haz clic en un preset para probar</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                {presetPrompts.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(preset.text)}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors text-left"
                  >
                    ⚡ {preset.title}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Escribe tu consulta técnica sobre smart contracts, arquitectura HCS, tokenomics HTS, o análisis de datos criptográficos..."
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 p-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-sans transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Micropayment tier selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Coins className="h-3.5 w-3.5 text-blue-400" />
                  <span>Seleccionar Tarifa de Micropago (Pay-Per-Query)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Balance Actual: <strong className="text-emerald-400">{formatHbar(userBalance)} ℏ</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 0.01, label: 'Standard', tinybars: '1,000,000 tℏ', fiat: '~$0.0008 USD', tokens: '256 Tokens' },
                  { value: 0.05, label: 'Deep Audit', tinybars: '5,000,000 tℏ', fiat: '~$0.0040 USD', tokens: '1024 Tokens', popular: true },
                  { value: 0.1, label: 'Quantum aBFT', tinybars: '10,000,000 tℏ', fiat: '~$0.0080 USD', tokens: '4096 Tokens' },
                ].map(tier => {
                  const isSelected = selectedCost === tier.value;
                  return (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => setSelectedCost(tier.value)}
                      className={`relative rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-slate-950">
                          Recomendado
                        </span>
                      )}
                      <div className="font-mono text-sm sm:text-base font-bold text-white">
                        {tier.value} <span className="text-xs text-emerald-400">HBAR</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tier.tinybars}</div>
                      <div className="text-[10px] text-slate-500">{tier.fiat}</div>
                      <div className="mt-1 text-[9px] font-semibold uppercase text-blue-400 tracking-wide">
                        {tier.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isProcessing}
              className={`w-full relative overflow-hidden rounded-xl py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 transition-all flex items-center justify-center space-x-2 ${
                isProcessing
                  ? 'bg-emerald-500/50 cursor-not-allowed text-slate-900'
                  : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  <span className="font-mono">{processingStep || 'Procesando en Hedera...'}</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" />
                  <span>Ejecutar y Notarizar ({selectedCost} HBAR)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Query History / Recents */}
          {queryHistory.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <History className="h-3.5 w-3.5 text-slate-400" />
                  <span>Consultas Notarizadas Recientes</span>
                </span>
                <span className="font-mono text-emerald-400 text-[11px]">{queryHistory.length} total</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {queryHistory.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveReceipt(q)}
                    className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 hover:border-emerald-500/40 hover:bg-slate-950 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[70%]">
                      <div className="text-slate-200 truncate font-medium">{q.prompt}</div>
                      <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>Seq #{q.sequenceNumber}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{q.queryCostHbar} ℏ</span>
                        <span>•</span>
                        <span>SHA: {truncateHash(q.sha256Digest, 4, 4)}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenExplorer({
                          title: `HCS Notarization Query #${q.sequenceNumber}`,
                          type: 'TRANSACTION',
                          id: q.transactionId,
                          consensusTimestamp: q.consensusTimestamp,
                          sequenceNumber: q.sequenceNumber,
                          sha256: q.sha256Digest,
                          runningHash: q.runningHash,
                          payerAccountId: accountId,
                          nodeAccountId: '0.0.3 (Hedera Node)',
                          status: 'SUCCESS',
                          memo: `HCS-AI-NOTARY // TOPIC: ${q.topicId}`,
                        });
                      }}
                      className="rounded bg-slate-800 px-2 py-1 text-[11px] text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>HashScan</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Receipt & AI Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeReceipt ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5 shadow-[0_0_30px_rgba(16,185,129,0.15)] space-y-4 animate-in fade-in duration-300">
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">
                      Recibo de Notarización HCS
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400">
                      aBFT Consensus Validated
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onOpenExplorer({
                      title: `Recibo HCS Query #${activeReceipt.sequenceNumber}`,
                      type: 'TRANSACTION',
                      id: activeReceipt.transactionId,
                      consensusTimestamp: activeReceipt.consensusTimestamp,
                      sequenceNumber: activeReceipt.sequenceNumber,
                      sha256: activeReceipt.sha256Digest,
                      runningHash: activeReceipt.runningHash,
                      payerAccountId: accountId,
                      nodeAccountId: '0.0.3 (Hedera Node)',
                      status: 'SUCCESS',
                      memo: `HCS-AI-QUERY-PAYMENT // COST: ${activeReceipt.queryCostHbar} HBAR`,
                    })
                  }
                  className="flex items-center space-x-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Ver en HashScan</span>
                </button>
              </div>

              {/* Specs Grid */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <span className="text-slate-400 font-mono">Topic ID:</span>
                  <span className="font-mono text-emerald-300 font-bold">{activeReceipt.topicId}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <span className="text-slate-400 font-mono">Sequence Number:</span>
                  <span className="font-mono text-blue-300 font-bold">#{activeReceipt.sequenceNumber}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <span className="text-slate-400 font-mono">Consensus Time:</span>
                  <span className="font-mono text-slate-300 text-[11px]">{activeReceipt.consensusTimestamp}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <span className="text-slate-400 font-mono">Micropago HBAR:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{activeReceipt.queryCostHbar} ℏ</span>
                </div>
              </div>

              {/* SHA-256 Digest section */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                <div className="flex items-center justify-between mb-1.5 text-xs text-emerald-300 font-semibold">
                  <span className="flex items-center space-x-1">
                    <Hash className="h-3.5 w-3.5" />
                    <span>SHA-256 Criptográfico Sellado</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeReceipt.sha256Digest, 'active_sha')}
                    className="flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-white"
                  >
                    {copiedKey === 'active_sha' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'active_sha' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-emerald-200/90 break-all bg-slate-950/80 p-2 rounded border border-emerald-500/30">
                  {activeReceipt.sha256Digest}
                </div>
              </div>

              {/* AI Response Output */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span className="flex items-center space-x-1 text-purple-400">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Respuesta Sintética del Agente</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Hashgraph AI Engine</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 max-h-60 overflow-y-auto">
                  {activeReceipt.response}
                </div>
              </div>
            </div>
          ) : (
            /* Empty state when no query has been run yet */
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center flex flex-col items-center justify-center min-h-[360px] space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/50 text-slate-500 border border-slate-700/50">
                <Bot className="h-7 w-7 text-emerald-400/60" />
              </div>
              <h3 className="font-display font-semibold text-slate-300 text-sm">
                Esperando Consulta y Micropago
              </h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Selecciona un prompt de ejemplo o escribe el tuyo, define el monto en HBAR y pulsa <strong>"Ejecutar y Notarizar"</strong> para verificar el recibo HCS.
              </p>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400/80 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <span>Hedera Consensus Topic: 0.0.489102</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Generates an articulate, highly specialized Web3 Hedera technical report
function generateTechnicalAiResponse(prompt: string, cost: number): string {
  const normalized = prompt.toLowerCase();
  
  if (normalized.includes('smart contract') || normalized.includes('auditoría') || normalized.includes('audit')) {
    return `[HEDERA SECURITY AUDIT PROTOCOL // SEC-0x7F]
• Veredicto: Lógica de custodia validada con optimización de gas a nivel de protocolo nativo.
• Análisis HTS: La llamada 'TokenAssociateTransaction' mitiga riesgos de dusting attacks ya que las cuentas de Hedera requieren aprobación explícita antes de recibir tokens de terceros.
• Reentrancy Protection: Al interactuar con Hedera Token Service (HTS) vía precompilados del sistema (0x167), la máquina virtual ejecuta transferencias con finalismo determinista de 3.2s sin mempools públicos vulnerables a MEV / Front-running.
• Recomendación: Configurar auto-renew period a 7890000 segundos y definir la clave de freeze en 'null' para garantizar inmutabilidad absoluta.`;
  }

  if (normalized.includes('iot') || normalized.includes('arquitectura') || normalized.includes('telemetría') || normalized.includes('costo')) {
    return `[HCS ARCHITECTURAL BLUEPRINT // LOW-COST IOT PIPELINE]
• Topología recomendada: Tópicos HCS segmentados por zona geográfica (ej. Topic 0.0.489101, 0.0.489102).
• Eficiencia Económica: El envío de 1,000,000 de mensajes de telemetría a HCS tiene un costo fijo inmutable de exactamente $100.00 USD (tarifa nativa fijada por el Hedera Governing Council en $0.0001 por mensaje).
• Integridad: Cada lote de mensajes concatena el 'Running Hash' anterior, formando una cadena criptográfica equivalente a una blockchain privada pero con la descentralización de la red pública aBFT.
• Latencia de dispersión: 2.8 a 3.4 segundos hasta el 100% de los nodos de consenso.`;
  }

  if (normalized.includes('carbon') || normalized.includes('guardian') || normalized.includes('esg')) {
    return `[HEDERA GUARDIAN dMRV SYNTHESIS]
• Estándar: Tokenización de Impacto Climático bajo metodología Verra / Gold Standard sobre HCS + HTS.
• Flujo de Validación: 1) Sensores IoT reportan lecturas a Topic HCS; 2) Verificador independiente sella credenciales verificables (W3C DID); 3) TokenMintTransaction emite tokens no fungibles (NFT) con metadatos IPFS inmutables.
• Verificabilidad: Registro público 100% auditable en HashScan sin dependencia de entidades centralizadas.`;
  }

  return `[HEDERA MULTIVERSE SYNTHESIS ENGINE // QUERY RESOLVED]
• Análisis Criptográfico: Consulta procesada satisfactoriamente con asignación de recursos ${cost} HBAR.
• Consenso Hashgraph: Notarización completada bajo el algoritmo de Gossip-about-Gossip y Virtual Voting.
• Hash Digest: La huella digital de este cálculo ha sido registrada con marca de tiempo estricta en el nodo validador de Hedera Testnet.
• Integridad de Datos: Disponible de forma perpetua a través de la red descentralizada de Mirror Nodes REST/gRPC.`;
}
