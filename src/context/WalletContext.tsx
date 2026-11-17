import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {readWallet, writeWallet} from '@/services/walletStorage';

type WalletData = {
    balance: number;
    moonBalance: number;
    ownedItems: string[];
    equippedItemId: string | null;
    bestScore: number;
};

type WalletCurrency = 'coins' | 'moons';

type WalletContextValue = WalletData & {
    ready: boolean;
    seedCoinsFromPet: (coins: number) => void;
    addCoins: (amount: number) => void;
    addMoons: (amount: number) => void;
    updateBestScore: (score: number) => void;
    purchaseItem: (itemId: string, cost: number, currency?: WalletCurrency) => boolean;
    equipItem: (itemId: string) => boolean;
    ownsItem: (itemId: string) => boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({children}: { children: React.ReactNode }) {
    const [balance, setBalance] = useState(0);
    const [moonBalance, setMoonBalance] = useState(0);
    const [ownedItems, setOwnedItems] = useState<string[]>([]);
    const [equippedItemId, setEquippedItemId] = useState<string | null>(null);
    const [welcomeBonusClaimed, setWelcomeBonusClaimed] = useState(false);
    const [bestScore, setBestScore] = useState(0);
    const [ready, setReady] = useState(false);
    // A carteira só passa a existir depois que encontramos um saldo salvo,
    // recebemos o saldo inicial do pet ou a primeira moeda é conquistada.
    const [hasWallet, setHasWallet] = useState(false);
    const canSeedPetCoins = useRef(false);
    const writeQueue = useRef<Promise<void>>(Promise.resolve());

    useEffect(() => {
        let active = true;
        readWallet().then((saved) => {
            if (!active) return;
            if (saved) {
                const shouldGrantBonus = !saved.welcomeBonusClaimed;
                setBalance(saved.balance + (shouldGrantBonus ? 2000 : 0));
                setMoonBalance(saved.moonBalance + (shouldGrantBonus ? 50 : 0));
                setOwnedItems(saved.ownedItems);
                setEquippedItemId(saved.equippedItemId);
                setBestScore(saved.bestScore ?? 0);
                setWelcomeBonusClaimed(true);
                setHasWallet(true);
            } else {
                setBalance(2000);
                setMoonBalance(50);
                setBestScore(0);
                setWelcomeBonusClaimed(true);
                setHasWallet(true);
                canSeedPetCoins.current = true;
            }
            setReady(true);
        });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!ready || !hasWallet) return;
        const snapshot = {balance, moonBalance, ownedItems, equippedItemId, welcomeBonusClaimed, bestScore};
        // Serializa gravações para que uma escrita antiga não sobrescreva uma nova.
        writeQueue.current = writeQueue.current
            .then(() => writeWallet(snapshot))
            .catch(() => undefined);
    }, [balance, moonBalance, ownedItems, equippedItemId, welcomeBonusClaimed, bestScore, ready, hasWallet]);

    const seedCoinsFromPet = useCallback((coins: number) => {
        if (!ready || !canSeedPetCoins.current) return;
        canSeedPetCoins.current = false;
        const safeCoins = Math.max(0, Math.floor(Number.isFinite(coins) ? coins : 0));
        if (safeCoins) setBalance((current) => current + safeCoins);
        setHasWallet(true);
    }, [ready]);

    const addCoins = useCallback((amount: number) => {
        const safeAmount = Math.max(0, Math.floor(amount));
        if (!safeAmount) return;
        setBalance((current) => current + safeAmount);
        setHasWallet(true);
    }, []);

    const addMoons = useCallback((amount: number) => {
        const safeAmount = Math.max(0, Math.floor(amount));
        if (!safeAmount) return;
        setMoonBalance((current) => current + safeAmount);
        setHasWallet(true);
    }, []);

    const updateBestScore = useCallback((score: number) => {
        const safeScore = Math.max(0, Math.floor(score));
        if (safeScore <= 0) return;
        setBestScore((current) => (safeScore > current ? safeScore : current));
        setHasWallet(true);
    }, []);

    const purchaseItem = useCallback((itemId: string, cost: number, currency: WalletCurrency = 'coins') => {
        const availableBalance = currency === 'moons' ? moonBalance : balance;
        if (!ready || !hasWallet || ownedItems.includes(itemId) || availableBalance < cost) return false;
        if (currency === 'moons') {
            setMoonBalance((current) => current - cost);
        } else {
            setBalance((current) => current - cost);
        }
        setOwnedItems((current) => current.includes(itemId) ? current : [...current, itemId]);
        setEquippedItemId(itemId);
        setHasWallet(true);
        return true;
    }, [balance, moonBalance, hasWallet, ownedItems, ready]);

    const equipItem = useCallback((itemId: string) => {
        if (!ownedItems.includes(itemId)) return false;
        setEquippedItemId(itemId);
        setHasWallet(true);
        return true;
    }, [ownedItems]);

    const ownsItem = useCallback((itemId: string) => ownedItems.includes(itemId), [ownedItems]);

    const value = useMemo(() => ({
        balance,
        moonBalance,
        ownedItems,
        equippedItemId,
        bestScore,
        ready,
        seedCoinsFromPet,
        addCoins,
        addMoons,
        updateBestScore,
        purchaseItem,
        equipItem,
        ownsItem,
    }), [balance, moonBalance, ownedItems, equippedItemId, bestScore, ready, seedCoinsFromPet, addCoins, addMoons, updateBestScore, purchaseItem, equipItem, ownsItem]);

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) throw new Error('useWallet precisa estar dentro de WalletProvider.');
    return context;
}
