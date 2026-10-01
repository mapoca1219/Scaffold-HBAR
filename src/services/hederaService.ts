import { Client, TopicMessageSubmitTransaction, AccountBalanceQuery, AccountId, PrivateKey, TransferTransaction, Hbar, HbarUnit } from '@hashgraph/sdk';

// Initialize a Hedera client (Testnet by default)
export const getHederaClient = () => {
  const accountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;
  const privateKey = import.meta.env.VITE_HEDERA_PRIVATE_KEY;
  const network = import.meta.env.VITE_HEDERA_NETWORK || 'testnet';

  let client;
  if (network === 'mainnet') {
    client = Client.forMainnet();
  } else {
    client = Client.forTestnet();
  }

  if (accountId && privateKey) {
    client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey));
  }

  return client;
};

// Fetch real account balance from Testnet
export const getRealAccountBalance = async (accountId: string) => {
  try {
    const client = getHederaClient();
    const query = new AccountBalanceQuery().setAccountId(accountId);
    const balance = await query.execute(client);
    return balance.hbars.toTinybars().toNumber() / 100_000_000;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return null;
  }
};

// Submit a real message to HCS
export const submitRealHcsMessage = async (topicId: string, message: string) => {
  try {
    const client = getHederaClient();
    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(client);
    const receipt = await tx.getReceipt(client);
    return {
      status: receipt.status.toString(),
      sequenceNumber: receipt.topicSequenceNumber?.toString(),
    };
  } catch (error) {
    console.error("Error submitting HCS message:", error);
    return null;
  }
};


export const transferTestnetHbar = async (toAccountId: string, amount: number) => {
  try {
    const client = getHederaClient();
    const tx = await new TransferTransaction()
      .addHbarTransfer(client.operatorAccountId!, Hbar.from(-amount, HbarUnit.Hbar))
      .addHbarTransfer(toAccountId, Hbar.from(amount, HbarUnit.Hbar))
      .execute(client);
    const receipt = await tx.getReceipt(client);
    return receipt.status.toString() === 'SUCCESS';
  } catch (error) {
    console.error("Error transferring HBAR:", error);
    return false;
  }
};
