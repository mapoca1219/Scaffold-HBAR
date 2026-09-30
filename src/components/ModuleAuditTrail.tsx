import React, { useState } from 'react';
import { 
  Database, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  FileJson, 
  Filter, 
  Search, 
  Download, 
  Clock, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Hash,
  Terminal,
  Activity
} from 'lucide-react';
import { HcsAuditEvent } from '../types/hedera';
import { calculateSha256, generateHederaConsensusTimestamp, generateTransactionId, truncateHash } from '../utils/crypto';

interface ModuleAuditTrailProps {
  accountId: string;
  userBalance: number;
  onDeductBalance: (amount: number) => boolean;
  onOpenExplorer: (detail: any) => void;
  onNewNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
}

const HCS_AUDIT_TOPIC_ID = '0.0.592184';

export const ModuleAuditTrail: React.FC<ModuleAuditTrailProps> = ({
  accountId,
  userBalance,
  onDeductBalance,
  onOpenExplorer,
  onNewNotification,
}) => {
  const [eventType, setEventType] = useState<HcsAuditEvent['eventType']>('ORDEN_CREADA');
  const [entityId, setEntityId] = useState('ORD-2026-X99');
  const [metadataJson, setMetadataJson] = useState(`{
  "cliente": "Hyperion Logistics Global",
  "almacen_origen": "HEDERA-WH-04",
  "items_total": 450,
  "temperatura_objetivo": "-18.5C",
  "inspector_id": "OP-9821"
}`);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consensusProgress, setConsensusProgress] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [sequenceCounter, setSequenceCounter] = useState<number>(104);

  // Initial mock events to populate the audit timeline
  const [events, setEvents] = useState<HcsAuditEvent[]>([
    {
      id: 'tx_audit_init_01',
      sequenceNumber: 104,
      topicId: HCS_AUDIT_TOPIC_ID,
      eventType: 'PROVEEDOR_VALIDADO',
      entityId: 'SUPPLIER-KYB-882',
      metadataJson: JSON.stringify({
        proveedor: 'AeroCables Corp',
        jurisdiccion: 'CH-Zurich',
        certificaciones: ['ISO-9001', 'AS9100D'],
        score_riesgo: '0.02'
      }, null, 2),
      submitterAccountId: accountId,
      consensusTimestamp: '1727712100.819230192',
      sha256Digest: '7a18b958c271e893e150385bf56642d99291176b6a03e62fcfec8198f12d592b',
      status: 'Consensus Confirmed',
      feeHbar: 0.00084,
    },
    {
      id: 'tx_audit_init_02',
      sequenceNumber: 103,
      topicId: HCS_AUDIT_TOPIC_ID,
      eventType: 'CONTROL_CALIDAD',
      entityId: 'BATCH-2026-X98',
      metadataJson: JSON.stringify({
        lote: 'BATCH-2026-X98',
        pureza: '99.98%',
        temperatura_sensores: '-19.2C',
        tolerancia_desvio: 'PASS'
      }, null, 2),
      submitterAccountId: '0.0.109284',
      consensusTimestamp: '1727711920.442910283',
      sha256Digest: '4c8e192a0e28f1181283c7482619dafe41938561947291048291048194829184',
      status: 'Consensus Confirmed',
      feeHbar: 0.00084,
    },
  ]);

  const presetTemplates = [
    {
      name: 'Orden de Venta',
      type: 'ORDEN_CREADA' as const,
      entity: 'ORD-2026-X99',
      data: {
        cliente: 'Hyperion Logistics Global',
        almacen_origen: 'HEDERA-WH-04',
        items_total: 450,
        temperatura_objetivo: '-18.5C',
        inspector_id: 'OP-9821'
      }
    },
    {
      name: 'Control de Calidad',
      type: 'CONTROL_CALIDAD' as const,
      entity: 'QC-BATCH-884',
      data: {
        laboratorio: 'BioTech Precision Labs',
        prueba_espectrometria: 'CONFORME',
        tolerancia_ppm: 0.04,
        sello_criptografico: 'SHA256_QC_OK'
      }
    },
    {
      name: 'Despacho Logístico',
      type: 'DESPACHADO' as const,
      entity: 'SHIP-BOL-7712',
      data: {
        transportista: 'Maersk Hedera Marine',
        precinto_iot_rfid: 'RFID-984-ACTIVE',
        puerto_salida: 'Rotterdam',
        eta_destino: '2026-10-04T12:00:00Z'
      }
    },
    {
      name: 'Firma Digital Legal',
      type: 'FIRMA_DIGITAL' as const,
      entity: 'CONTRACT-MOU-2026',
      data: {
        partes: ['Hedera Hashgraph LLC', 'Enterprise Partner SA'],
        hash_documento_pdf: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        jurisdiccion_arbitraje: 'ICC Paris'
      }
    }
  ];

  const applyPreset = (preset: typeof presetTemplates[0]) => {
    setEventType(preset.type);
    setEntityId(preset.entity);
    setMetadataJson(JSON.stringify(preset.data, null, 2));
    setJsonError(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSubmitToConsensus = async () => {
    // Validate JSON
    try {
      JSON.parse(metadataJson);
      setJsonError(null);
    } catch (e: any) {
      setJsonError('Sintaxis JSON inválida: ' + e.message);
      return;
    }

    if (!entityId.trim()) {
      onNewNotification('Identificador requerido', 'Ingresa un ID de entidad o lote de negocio.', 'info');
      return;
    }

    // Fee for HCS submit message (~$0.0001 USD = ~0.0012 HBAR)
    const hcsFee = 0.0012;
    if (userBalance < hcsFee) {
      onNewNotification('Balance insuficiente', 'Se requiere una fracción mínima de HBAR para la tasa de red.', 'error');
      return;
    }

    setIsSubmitting(true);
    setConsensusProgress('1. Generando digest criptográfico SHA-256...');

    try {
      // Step 1: Calculate canonical SHA-256
      const payloadToHash = JSON.stringify({
        topic: HCS_AUDIT_TOPIC_ID,
        eventType,
        entityId,
        metadata: JSON.parse(metadataJson),
        submitter: accountId,
      });

      const sha256 = await calculateSha256(payloadToHash);

      await new Promise(r => setTimeout(r, 650));
      setConsensusProgress('2. Transmitiendo Gossip-about-Gossip a nodos de Hedera...');

      await new Promise(r => setTimeout(r, 850));
      setConsensusProgress('3. Virtual Voting aBFT calculando consenso inmutable...');

      // Deduct minimal fee
      onDeductBalance(hcsFee);

      await new Promise(r => setTimeout(r, 700));
      setConsensusProgress('4. Sellando secuencia y Running Hash en Topic ' + HCS_AUDIT_TOPIC_ID + '...');

      const nextSeq = sequenceCounter + 1;
      setSequenceCounter(nextSeq);
      const timestamp = generateHederaConsensusTimestamp();
      const txId = generateTransactionId(accountId);

      const newEvent: HcsAuditEvent = {
        id: txId,
        sequenceNumber: nextSeq,
        topicId: HCS_AUDIT_TOPIC_ID,
        eventType,
        entityId,
        metadataJson,
        submitterAccountId: accountId,
        consensusTimestamp: timestamp,
        sha256Digest: sha256,
        status: 'Consensus Confirmed',
        feeHbar: hcsFee,
      };

      await new Promise(r => setTimeout(r, 450));
      setEvents(prev => [newEvent, ...prev]);

      onNewNotification(
        'Evento Notarizado en Hedera Consensus Service',
        `Evento ${eventType} [${entityId}] confirmado con Seq #${nextSeq}.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      onNewNotification('Error de consenso', 'No se pudo someter el evento a HCS.', 'error');
    } finally {
      setIsSubmitting(false);
      setConsensusProgress('');
    }
  };

  // Filtered list
  const filteredEvents = events.filter(e => {
    const matchesType = filterType === 'ALL' || e.eventType === filterType;
    const matchesSearch = 
      e.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sha256Digest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sequenceNumber.toString().includes(searchQuery);
    return matchesType && matchesSearch;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hedera_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getEventBadgeColor = (type: HcsAuditEvent['eventType']) => {
    switch (type) {
      case 'ORDEN_CREADA':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'CONTROL_CALIDAD':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'DESPACHADO':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'AUDITORIA_SEGURIDAD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'FIRMA_DIGITAL':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'PROVEEDOR_VALIDADO':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-emerald-950/30 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display text-lg font-bold text-white">
                  MÓDULO 3: Enterprise Audit Trail (HCS Data Notary)
                </h2>
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 border border-purple-500/30">
                  Immutable aBFT Log
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Notarización criptográfica inmutable para eventos empresariales críticos con ordenamiento cronológico justo garantizado.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Enterprise Topic ID</span>
              <span className="font-mono text-purple-300 font-semibold">{HCS_AUDIT_TOPIC_ID}</span>
            </div>
            <button
              onClick={exportToJson}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 hover:border-purple-500/40 hover:text-white transition-colors"
              title="Descargar registro de auditoría en JSON"
            >
              <Download className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Register Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                <span>Registrar Evento de Negocio Inmutable</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Tarifa fija: $0.0001</span>
            </div>

            {/* Presets */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Plantillas de Negocio Rápidas:</div>
              <div className="flex flex-wrap gap-1.5">
                {presetTemplates.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1 text-[11px] text-slate-300 hover:border-purple-500/40 hover:text-purple-300 transition-colors"
                  >
                    ✦ {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Type selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tipo de Evento
              </label>
              <select
                value={eventType}
                onChange={e => setEventType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none font-mono"
              >
                <option value="ORDEN_CREADA">ORDEN_CREADA (Supply Chain)</option>
                <option value="CONTROL_CALIDAD">CONTROL_CALIDAD (Pharma / Precision)</option>
                <option value="DESPACHADO">DESPACHADO (IoT Logistics)</option>
                <option value="AUDITORIA_SEGURIDAD">AUDITORIA_SEGURIDAD (Infosec / Devops)</option>
                <option value="FIRMA_DIGITAL">FIRMA_DIGITAL (Legal Tech)</option>
                <option value="PROVEEDOR_VALIDADO">PROVEEDOR_VALIDADO (KYB Compliance)</option>
              </select>
            </div>

            {/* Entity / Batch ID */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Identificador de Entidad / Lote (Entity ID)
              </label>
              <input
                type="text"
                value={entityId}
                onChange={e => setEntityId(e.target.value)}
                placeholder="ej: BATCH-2026-X99"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Metadata JSON Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <FileJson className="h-3.5 w-3.5 text-purple-400" />
                  <span>Metadata del Evento (JSON Estructurado)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const formatted = JSON.stringify(JSON.parse(metadataJson), null, 2);
                      setMetadataJson(formatted);
                      setJsonError(null);
                    } catch (e: any) {
                      setJsonError(e.message);
                    }
                  }}
                  className="text-[10px] text-purple-400 hover:underline"
                >
                  Formatear JSON
                </button>
              </div>

              <textarea
                rows={6}
                value={metadataJson}
                onChange={e => {
                  setMetadataJson(e.target.value);
                  try {
                    JSON.parse(e.target.value);
                    setJsonError(null);
                  } catch (err: any) {
                    setJsonError(err.message);
                  }
                }}
                className={`w-full rounded-xl border bg-slate-950/90 p-3 font-mono text-xs text-emerald-300/90 focus:outline-none ${
                  jsonError ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-700 focus:border-purple-500'
                }`}
              />
              {jsonError && (
                <div className="mt-1 text-[11px] text-rose-400 font-mono">
                  ⚠ Error de sintaxis: {jsonError}
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmitToConsensus}
              disabled={isSubmitting || Boolean(jsonError)}
              className={`w-full relative overflow-hidden rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-2 ${
                isSubmitting || jsonError
                  ? 'bg-purple-900/50 cursor-not-allowed text-slate-400'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="font-mono text-[11px]">{consensusProgress || 'Emitiendo a Consenso...'}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Emitir a Consenso Hedera</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Timeline & Table of Events (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID, SHA-256 o Seq..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-purple-500 focus:outline-none font-mono"
              >
                <option value="ALL">Todos los Eventos ({events.length})</option>
                <option value="ORDEN_CREADA">ORDEN_CREADA</option>
                <option value="CONTROL_CALIDAD">CONTROL_CALIDAD</option>
                <option value="DESPACHADO">DESPACHADO</option>
                <option value="AUDITORIA_SEGURIDAD">AUDITORIA_SEGURIDAD</option>
                <option value="FIRMA_DIGITAL">FIRMA_DIGITAL</option>
                <option value="PROVEEDOR_VALIDADO">PROVEEDOR_VALIDADO</option>
              </select>
            </div>
          </div>

          {/* Timeline of events */}
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center text-xs text-slate-500">
                No hay eventos que coincidan con los filtros actuales.
              </div>
            ) : (
              filteredEvents.map(event => {
                const isExpanded = expandedEventId === event.id;
                return (
                  <div
                    key={event.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700 shadow-md space-y-3"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-xs font-mono font-bold text-slate-300">
                          #{event.sequenceNumber}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-mono font-semibold border ${getEventBadgeColor(
                            event.eventType
                          )}`}
                        >
                          {event.eventType}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {event.entityId}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Consensus Confirmed</span>
                        </span>

                        <button
                          onClick={() =>
                            onOpenExplorer({
                              title: `Auditoría HCS Evento #${event.sequenceNumber} - ${event.eventType}`,
                              type: 'TRANSACTION',
                              id: event.id,
                              consensusTimestamp: event.consensusTimestamp,
                              sequenceNumber: event.sequenceNumber,
                              sha256: event.sha256Digest,
                              payerAccountId: event.submitterAccountId,
                              nodeAccountId: '0.0.3 (Hedera Node)',
                              status: 'SUCCESS',
                              memo: `HCS-AUDIT // ${event.eventType} // ${event.entityId}`,
                              rawJson: {
                                hcs_topic_id: event.topicId,
                                sequence_number: event.sequenceNumber,
                                consensus_timestamp: event.consensusTimestamp,
                                event_type: event.eventType,
                                entity_id: event.entityId,
                                payload_metadata: JSON.parse(event.metadataJson),
                                sha256_digest: event.sha256Digest,
                                status: event.status,
                              },
                            })
                          }
                          className="rounded bg-slate-800 p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Inspeccionar en HashScan"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Hashes details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500">Consensus Time:</span>{' '}
                        <span className="font-mono text-slate-300">{event.consensusTimestamp}</span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-start sm:space-x-2">
                        <span className="text-slate-500">SHA-256:</span>
                        <span className="font-mono text-emerald-300 truncate max-w-[140px]">
                          {truncateHash(event.sha256Digest, 6, 6)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(event.sha256Digest, event.id + '_sha')}
                          className="text-slate-400 hover:text-white"
                          title="Copiar hash completo"
                        >
                          {copiedKey === event.id + '_sha' ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expand/Collapse JSON Payload */}
                    <div>
                      <button
                        onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                        className="flex items-center space-x-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <span>{isExpanded ? 'Ocultar Carga Útil' : 'Ver Payload JSON Completo'}</span>
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 p-3 rounded-lg border border-slate-800 bg-slate-950 font-mono text-[11px] text-emerald-300/90 overflow-x-auto">
                          {event.metadataJson}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
