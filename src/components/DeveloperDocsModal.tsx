import React, { useState } from 'react';
import { X, Code2, BookOpen, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface DeveloperDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperDocsModal: React.FC<DeveloperDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'hcs_ai' | 'hts_gate' | 'audit_trail'>('hcs_ai');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const codeSnippets = {
    hcs_ai: `// 1. Instalar Hedera SDK: npm install @hashgraph/sdk
import { Client, TopicMessageSubmitTransaction, TransferTransaction, Hbar } from "@hashgraph/sdk";

// Inicializar cliente Hedera Testnet
const client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);

// Paso A: Cobrar micropago HBAR al usuario
const paymentTx = await new TransferTransaction()
  .addHbarTransfer(userAccountId, new Hbar(-0.05))
  .addHbarTransfer(aiServiceAccountId, new Hbar(0.05))
  .execute(client);
await paymentTx.getReceipt(client);

// Paso B: Notarizar Prompt + Respuesta de IA en Hedera Consensus Service (HCS)
const sha256Digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(aiResponse));
const payload = JSON.stringify({
  queryId: "AI-QUERY-" + Date.now(),
  promptSha: promptHash,
  responseSha: sha256DigestHex,
  notarizedAt: new Date().toISOString()
});

const submitMsgTx = await new TopicMessageSubmitTransaction()
  .setTopicId("0.0.489102")
  .setMessage(payload)
  .execute(client);

const receipt = await submitMsgTx.getReceipt(client);
console.log("HCS Consensus Sequence #:", receipt.topicSequenceNumber.toString());`,

    hts_gate: `// Token-Gating sin Smart Contracts (Zero-Smart-Contract Auth)
// Consulta ultrarrápida al Mirror Node público de Hedera (<100ms de latencia)

async function checkTokenGateAccess(accountId: string, requiredTokenId: string) {
  const mirrorUrl = \`https://testnet.mirrornode.hedera.com/api/v1/accounts/\${accountId}/tokens?token.id=\${requiredTokenId}\`;
  
  const response = await fetch(mirrorUrl);
  const data = await response.json();
  
  // Si la cuenta posee >= 1 token de membresía HTS
  const hasAccess = data.tokens?.some((t: any) => 
    t.token_id === requiredTokenId && parseInt(t.balance, 10) > 0
  );
  
  return {
    authorized: Boolean(hasAccess),
    tokenId: requiredTokenId,
    timestamp: Date.now()
  };
}

// Ventaja Hedera: Cero costos de gas EVM para autenticación.
// El estado se resuelve directo desde los Mirror Nodes a 10,000+ TPS.`,

    audit_trail: `// Enterprise Audit Trail con Hedera Consensus Service (HCS)
import { Client, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

export async function recordImmutableAuditTrail(eventData: {
  eventType: string;
  entityId: string;
  metadata: Record<string, any>;
}) {
  const client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);
  
  // Generar hash canónico del evento
  const serialized = JSON.stringify(eventData);
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(serialized));
  const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Somete a ordenamiento justo y marca de tiempo de consenso aBFT
  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(process.env.AUDIT_TOPIC_ID!)
    .setMessage(JSON.stringify({ ...eventData, sha256 }))
    .execute(client);

  const receipt = await tx.getReceipt(client);
  return {
    status: receipt.status.toString(),
    sequenceNumber: receipt.topicSequenceNumber.toString(),
    runningHash: receipt.topicRunningHash.toString(),
    sha256
  };
}`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Code2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base">
                Scaffold-HBAR Architecture & Code Snippets
              </h2>
              <p className="text-xs text-slate-400">
                Guía técnica de integración para desarrolladores Web3 en Hedera Hashgraph
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveCodeTab('hcs_ai')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeCodeTab === 'hcs_ai'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. HBAR Micropayments + HCS AI
          </button>
          <button
            onClick={() => setActiveCodeTab('hts_gate')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeCodeTab === 'hts_gate'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. HTS Zero-Contract Token Gating
          </button>
          <button
            onClick={() => setActiveCodeTab('audit_trail')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeCodeTab === 'audit_trail'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Enterprise HCS Audit Trail
          </button>
        </div>

        {/* Code & Architectural notes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Código de producción con <code>@hashgraph/sdk</code></span>
            </div>
            <button
              onClick={() => copyToClipboard(codeSnippets[activeCodeTab], activeCodeTab)}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copiedKey === activeCodeTab ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copiar Snippet</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-emerald-300/90 overflow-x-auto leading-relaxed max-h-[380px]">
              {codeSnippets[activeCodeTab]}
            </pre>
          </div>

          {/* Value proposition callout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="font-semibold text-emerald-400 mb-1">Costo Fijo Predictible</div>
              <p className="text-slate-400 text-[11px]">
                Hedera ancla las tarifas en USD ($0.0001 por mensaje HCS). Sin volatilidad de gas durante congestión de red.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="font-semibold text-blue-400 mb-1">Finalidad aBFT Inmediata</div>
              <p className="text-slate-400 text-[11px]">
                Consenso real en ~3.2 segundos con ordenamiento justo asegurado matemáticamente por el algoritmo Hashgraph.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="font-semibold text-purple-400 mb-1">Zero-Smart-Contract Auth</div>
              <p className="text-slate-400 text-[11px]">
                HTS Token Service gestiona saldos y royalties de manera nativa sin desplegar bytecode Solidity vulnerable.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>Scaffold-HBAR // Arquitectura Next.js + Hedera Hashgraph</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Entendido, volver a la App
          </button>
        </div>
      </div>
    </div>
  );
};
