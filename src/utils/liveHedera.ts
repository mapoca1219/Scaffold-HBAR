export const fetchLiveBalance = async (accountId: string): Promise<number | null> => {
  try {
    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.balance.balance / 100_000_000;
  } catch (err) {
    console.error("Live Hedera error:", err);
    return null;
  }
};
