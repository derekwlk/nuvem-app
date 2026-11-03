export type WalletStoredData = {
  balance: number;
  moonBalance: number;
  ownedItems: string[];
  equippedItemId: string | null;
  welcomeBonusClaimed: boolean;
  bestScore?: number;
};

const STORAGE_KEY = 'nuvinha.wallet.v1';

export async function readWallet(): Promise<WalletStoredData | null> {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WalletStoredData>;
    if (typeof parsed.balance !== 'number' || !Number.isFinite(parsed.balance)) return null;
    return {
      balance: Math.max(0, Math.floor(parsed.balance)),
      moonBalance: Math.max(0, Math.floor(
        typeof parsed.moonBalance === 'number' && Number.isFinite(parsed.moonBalance)
          ? parsed.moonBalance
          : 0,
      )),
      ownedItems: Array.isArray(parsed.ownedItems)
        ? parsed.ownedItems.filter((item): item is string => typeof item === 'string')
        : [],
      equippedItemId: typeof parsed.equippedItemId === 'string' ? parsed.equippedItemId : null,
      welcomeBonusClaimed: parsed.welcomeBonusClaimed === true,
      bestScore: typeof parsed.bestScore === 'number' && Number.isFinite(parsed.bestScore)
        ? Math.max(0, Math.floor(parsed.bestScore))
        : 0,
    };
  } catch {
    return null;
  }
}

export async function writeWallet(data: WalletStoredData): Promise<void> {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Não foi possível salvar a carteira da Nuvinha:', error);
  }
}
