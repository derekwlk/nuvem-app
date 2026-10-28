// VIEW: tela Cuidar — agora busca o pet de verdade na API (Controller)
// e mostra nível, XP e moedas reais, além da Nuvinha animada.

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import NuvinhaPet from '@/components/NuvinhaPet';
import {buscarPrimeiroPet} from '@/controllers/PetController';
import {Pet} from '@/models/Pet';
import {useWallet} from '@/context/WalletContext';

export default function TelaCuidar() {
    // "estado" local da tela: guarda o pet buscado e se ainda está carregando.
    const [pet, setPet] = useState<Pet | null>(null);
    const [carregando, setCarregando] = useState(true);
    const {balance, ready: carteiraPronta, seedCoinsFromPet} = useWallet();

    // useEffect com [] no final = roda só uma vez, quando a tela abre.
    useEffect(() => {
        buscarPrimeiroPet()
            .then((resultado) => setPet(resultado))
            .catch((erro) => console.log('Erro ao buscar pet:', erro))
            .finally(() => setCarregando(false));
    }, []);

    useEffect(() => {
        if (pet && carteiraPronta) seedCoinsFromPet(pet.moedas);
    }, [pet, carteiraPronta, seedCoinsFromPet]);

    // Enquanto a chamada à API não termina, mostra um "girando" de carregamento
    // em vez de uma tela vazia ou quebrada.
    if (carregando) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6FCF97"/>
            </View>
        );
    }

    // Se terminou de carregar mas não achou nenhum pet no banco.
    if (!pet) {
        return (
            <View style={styles.container}>
                <Text style={styles.aviso}>Nenhum pet encontrado. Crie um pelo Admin do Django.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <NuvinhaPet humor="feliz" size={200}/>
            <Text style={styles.nome}>{pet.nome}</Text>
            <View style={styles.statsLinha}>
                <Text style={styles.stat}>Nível {pet.nivel}</Text>
                <Text style={styles.stat}>⭐ {pet.xp} XP</Text>
                <Text style={styles.stat}>🪙 {balance.toLocaleString('pt-BR')}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EAF6F6',
        gap: 12,
    },
    nome: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3D3050',
    },
    statsLinha: {
        flexDirection: 'row',
        gap: 16,
    },
    stat: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7C6E8C',
    },
    aviso: {
        fontSize: 14,
        color: '#7C6E8C',
        paddingHorizontal: 24,
        textAlign: 'center',
    },
});
