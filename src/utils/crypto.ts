/**
 * Computes live SHA-256 hash using the browser's native Web Crypto API
 */
export async function calculateSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataUint8 = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Formats seconds into Hedera consensus timestamp format (e.g. 1727712394.102938475)
 */
export function generateHederaConsensusTimestamp(): string {
  const now = Date.now();
  const seconds = Math.floor(now / 1000);
  const nanos = Math.floor(Math.random() * 900000000 + 100000000);
  return `${seconds}.${nanos}`;
}

/**
 * Generates standard Hedera Transaction ID format: {shard}.{realm}.{num}@{seconds}.{nanos}
 */
export function generateTransactionId(accountId: string): string {
  const now = Date.now();
  const seconds = Math.floor(now / 1000);
  const nanos = Math.floor(Math.random() * 900000000 + 100000000);
  return `${accountId}@${seconds}.${nanos}`;
}

/**
 * Truncate long hex hashes for display (e.g. 0x8a92...4b12)
 */
export function truncateHash(hash: string, startChars = 8, endChars = 8): string {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Formats tinybars into HBAR (1 HBAR = 100,000,000 tinybars)
 */
export function formatHbar(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}
