import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useWallet} from '@/context/WalletContext';

type ShopItem = {
    id: string;
    emoji: string;
    name: string;
    description: string;
    cost: number;
    currency: 'coins' | 'moons';
    accent: string;
    background: string;
};

const ITEMS: ShopItem[] = [
    {
        id: 'face-cat',
        emoji: ':3',
        name: 'Carinha :3',
        description: 'Uma expressão felina e muito fofinha.',
        cost: 150,
        currency: 'coins',
        accent: '#8F80CB',
        background: '#F0EDFF',
    },
    {
        id: 'face-tongue',
        emoji: ':p',
        name: 'Carinha :p',
        description: 'Uma carinha brincalhona com a língua de fora.',
        cost: 150,
        currency: 'coins',
        accent: '#C36F99',
        background: '#FFF0F6',
    },
    {
        id: 'face-laugh',
        emoji: 'XD',
        name: 'Carinha XD',
        description: 'Olhinhos fechados e uma risada bem grande.',
        cost: 250,
        currency: 'coins',
        accent: '#6C9E9A',
        background: '#E9F8F5',
    },
    {
        id: 'cloud-cap',
        emoji: '🧢',
        name: 'Boné',
        description: 'Um boné estiloso para acompanhar cada voo.',
        cost: 500,
        currency: 'coins',
        accent: '#5577A6',
        background: '#EDF4FF',
    },
    {
        id: 'rainbow-undercloud',
        emoji: '🌈',
        name: 'Arco-íris',
        description: 'Um arco-íris aparece saindo debaixo da Nuvinha.',
        cost: 1000,
        currency: 'coins',
        accent: '#6C9E9A',
        background: '#E9F8F5',
    },
    {
        id: 'dark-cloud-companion',
        emoji: '🌩️',
        name: 'Nuvem escura',
        description: 'Uma pequena companheira que voa logo abaixo da Nuvinha.',
        cost: 15,
        currency: 'moons',
        accent: '#65647F',
        background: '#F0EFF7',
    },
];

export default function TelaLoja() {
    const {balance, moonBalance, ready, purchaseItem, equipItem, ownsItem, equippedItemId} = useWallet();
    const [notice, setNotice] = React.useState('');

    const buy = (item: ShopItem) => {
        if (ownsItem(item.id)) {
            const equipped = equipItem(item.id);
            setNotice(equipped ? `${item.name} está equipado para sua próxima viagem.` : 'Não foi possível equipar esse mimo.');
            return;
        }
        const success = purchaseItem(item.id, item.cost, item.currency);
        const currencyName = item.currency === 'moons' ? 'Luas' : 'moedinhas';
        setNotice(success ? `${item.name} agora é seu e já está equipado!` : `Ainda faltam ${currencyName} para esse mimo.`);
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>UM MIMO PARA VOCÊ</Text>
                    <Text style={styles.title}>Loja das nuvens</Text>
                </View>
                <View style={styles.walletBalances}>
                    <View style={styles.walletPill}>
                        <Text style={styles.coinIcon}>🪙</Text>
                        <Text style={styles.balance}>{balance.toLocaleString('pt-BR')}</Text>
                    </View>
                    <View style={styles.walletPill}>
                        <Text style={styles.coinIcon}>🌙</Text>
                        <Text style={styles.balance}>{moonBalance.toLocaleString('pt-BR')}</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.subtitle}>Troque suas moedinhas por pequenos encantos. Luas raras são uma conquista
                especial.</Text>

            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                {ITEMS.map((item) => {
                    const owned = ownsItem(item.id);
                    const itemBalance = item.currency === 'moons' ? moonBalance : balance;
                    const canAfford = itemBalance >= item.cost;
                    return (
                        <View key={item.id} style={[styles.itemCard, {backgroundColor: item.background}]}>
                            <View style={[styles.itemArt, {backgroundColor: 'rgba(255,255,255,0.8)'}]}>
                                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                                <View style={styles.artSparkle}><Text style={styles.artSparkleText}>✦</Text></View>
                            </View>
                            <View style={styles.itemInfo}>
                                <Text style={[styles.itemName, {color: item.accent}]}>{item.name}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                                <View style={styles.itemFooter}>
                                    <View style={styles.price}>
                                        <Text
                                            style={styles.priceCoin}>{item.currency === 'moons' ? '🌙' : '🪙'}</Text>
                                        <Text style={styles.priceText}>{item.cost}</Text>
                                    </View>
                                    <Pressable
                                        onPress={() => buy(item)}
                                        disabled={!ready || (!owned && !canAfford)}
                                        style={({pressed}) => [
                                            styles.buyButton,
                                            {backgroundColor: owned ? '#FFFFFF' : item.accent},
                                            owned && styles.ownedButton,
                                            !owned && !canAfford && styles.cannotAfford,
                                            pressed && !owned && canAfford && styles.buttonPressed,
                                        ]}
                                    >
                                        <Text
                                            style={[styles.buyButtonText, owned && {color: item.accent}, !owned && !canAfford && styles.cannotAffordText]}>
                                            {owned ? (equippedItemId === item.id ? '✓ Equipado' : 'Equipar') : !ready ? 'Carregando' : canAfford ? 'Adquirir' : item.currency === 'moons' ? 'Faltam Luas' : 'Faltam moedas'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    );
                })}
                <View style={styles.tipCard}>
                    <Text style={styles.tipEmoji}>☁️</Text>
                    <View style={styles.tipCopy}>
                        <Text style={styles.tipTitle}>Como ganhar mais?</Text>
                        <Text style={styles.tipText}>As moedinhas vêm das partidas. A Lua aparece raramente durante
                            o voo: tente coletá-la antes que desapareça.</Text>
                    </View>
                </View>
            </ScrollView>
            {notice ? (
                <Pressable accessibilityRole="button" onPress={() => setNotice('')} style={styles.notice}>
                    <Text style={styles.noticeText}>{notice} ×</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#F8F6FF', paddingHorizontal: 18, paddingTop: 16},
    header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
    walletBalances: {flexDirection: 'row', alignItems: 'center', gap: 6},
    eyebrow: {fontSize: 9, letterSpacing: 1.6, fontWeight: '800', color: '#A098BB', marginBottom: 4},
    title: {fontSize: 25, fontWeight: '900', color: '#51466F', letterSpacing: -0.7},
    walletPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#EEE8FB'
    },
    coinIcon: {fontSize: 18},
    balance: {fontSize: 15, fontWeight: '900', color: '#6A5A91', fontVariant: ['tabular-nums']},
    subtitle: {color: '#9086AA', fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 14, maxWidth: 310},
    list: {gap: 12, paddingBottom: 24},
    itemCard: {
        borderRadius: 24,
        padding: 13,
        flexDirection: 'row',
        gap: 13,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.85)'
    },
    itemArt: {
        width: 83,
        minHeight: 110,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    itemEmoji: {fontSize: 42},
    artSparkle: {position: 'absolute', top: 10, right: 12},
    artSparkleText: {color: '#C6B6E8', fontSize: 15},
    itemInfo: {flex: 1, justifyContent: 'center', paddingVertical: 2},
    itemName: {fontSize: 15, fontWeight: '900', letterSpacing: -0.2},
    itemDescription: {color: '#827A9B', fontSize: 11, lineHeight: 16, marginTop: 4},
    itemFooter: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7, marginTop: 12},
    price: {flexDirection: 'row', alignItems: 'center', gap: 4},
    priceCoin: {fontSize: 15},
    priceText: {color: '#6B608D', fontSize: 13, fontWeight: '900'},
    buyButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 32
    },
    ownedButton: {borderWidth: 1, borderColor: 'rgba(120,110,150,0.14)'},
    cannotAfford: {backgroundColor: '#E5E0EE'},
    buttonPressed: {opacity: 0.82, transform: [{scale: 0.97}]},
    buyButtonText: {color: '#FFFFFF', fontSize: 10, fontWeight: '900'},
    cannotAffordText: {color: '#948BA9'},
    tipCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 15,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0EBFA',
        marginTop: 2
    },
    tipEmoji: {fontSize: 29},
    tipCopy: {flex: 1},
    tipTitle: {color: '#655780', fontSize: 13, fontWeight: '900'},
    tipText: {color: '#988FAE', fontSize: 11, lineHeight: 16, marginTop: 4},
    notice: {
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: '#635487',
        shadowColor: '#655487',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    noticeText: {color: '#FFFFFF', fontWeight: '700', fontSize: 12, textAlign: 'center'},
});
