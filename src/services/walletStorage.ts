import * as FileSystem from 'expo-file-system/legacy';

export type WalletStoredData = {
    balance: number;
    moonBalance: number;
    ownedItems: string[];
    equippedItemId: string | null;
    welcomeBonusClaimed: boolean;
    bestScore?: number;
};

const WALLET_FILE = FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}nuvinha-wallet.json`
    : null;
const WEB_WALLET_KEY = 'nuvinha-wallet';

export async function readWallet(): Promise<WalletStoredData | null> {
    try {
        if (!WALLET_FILE) {
            if (typeof localStorage === 'undefined') return null;
            const raw = localStorage.getItem(WEB_WALLET_KEY);
            return raw ? validateWallet(JSON.parse(raw)) : null;
        }
        const info = await FileSystem.getInfoAsync(WALLET_FILE);
        if (!info.exists) return null;
        const raw = await FileSystem.readAsStringAsync(WALLET_FILE);
        return validateWallet(JSON.parse(raw));
    } catch {
        return null;
    }
}

export async function writeWallet(data: WalletStoredData): Promise<void> {
    try {
        if (!WALLET_FILE) {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(WEB_WALLET_KEY, JSON.stringify(data));
            }
            return;
        }
        await FileSystem.writeAsStringAsync(WALLET_FILE, JSON.stringify(data));
    } catch (error) {
        console.warn('Não foi possível salvar a carteira da Nuvinha:', error);
    }
}

function validateWallet(value: unknown): WalletStoredData | null {
    if (!value || typeof value !== 'object') return null;
    const parsed = value as Partial<WalletStoredData>;
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
}
