// VIEW: tela Conversar. A Nuvinha aparece no topo e conversa com a criança.
// Fluxo: saudação → criança escolhe o humor → Nuvinha responde → convite
// para escrever (opcional) → envia o check-in → agradecimento.
import React, {useRef, useState, useEffect} from 'react';
import {
    View, Text, TextInput, Pressable, ScrollView, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import NuvinhaPet from '@/components/NuvinhaPet';
import BalaoMensagem from '@/components/BalaoMensagem';
import DigitandoIndicador from '@/components/DigitandoIndicador';
import {Mensagem} from '@/models/Mensagem';
import {buscarPrimeiroPet} from '@/controllers/PetController';
import {enviarCheckinHumor} from '@/controllers/CheckinController';
import {
    HUMORES, HumorPet, SAUDACAO, CONVITE_TEXTO, AVISO_PRIVACIDADE,
    novaMensagem, respostaAoHumor, agradecimento,
} from '@/controllers/ConversaController';

// Em que momento da conversa estamos (decide o que aparece embaixo)
type Etapa = 'humor' | 'texto' | 'enviando' | 'erro' | 'fim';

// Pausa assíncrona: "await esperar(900)" espera 900 milissegundos
const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function TelaConversar() {
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<any>(null);
    const iniciou = useRef(false);        // evita começar a conversa duas vezes
    const ultimoTexto = useRef('');       // texto que a criança escreveu (para reenviar)

    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [digitando, setDigitando] = useState(false);
    const [etapa, setEtapa] = useState<Etapa>('humor');
    const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
    const [humorPet, setHumorPet] = useState<HumorPet>('feliz');
    const [humorEscolhido, setHumorEscolhido] = useState<string | null>(null);
    const [texto, setTexto] = useState('');

    // A Nuvinha "fala": mostra as bolinhas, espera um pouco, solta o balão.
    async function nuvinhaFala(frases: string[]) {
        for (const frase of frases) {
            setDigitando(true);
            await esperar(900);
            setDigitando(false);
            setMensagens((m) => [...m, novaMensagem('nuvinha', frase)]);
            await esperar(300);
        }
    }

    // Começa (ou recomeça) a conversa do zero
    async function iniciarConversa() {
        setMensagens([]);
        setEtapa('humor');
        setMostrarOpcoes(false);
        setHumorEscolhido(null);
        setHumorPet('feliz');
        setTexto('');
        await nuvinhaFala(SAUDACAO);
        setMostrarOpcoes(true);               // só mostra os emojis depois da saudação
    }

    useEffect(() => {
        if (iniciou.current) return;
        iniciou.current = true;
        iniciarConversa();
    }, []);

    // A criança tocou em um humor
    async function escolherHumor(h: (typeof HUMORES)[number]) {
        setMostrarOpcoes(false);
        setHumorEscolhido(h.emoji);
        setHumorPet(h.humorPet);              // a aura da Nuvinha muda de cor
        setMensagens((m) => [...m, novaMensagem('crianca', `${h.emoji} ${h.label}`)]);
        await esperar(500);
        await nuvinhaFala(respostaAoHumor(h.emoji));
        await nuvinhaFala([CONVITE_TEXTO]);
        setEtapa('texto');
    }

    // A criança escreveu (ou escolheu não escrever): guarda e envia
    function aoResponderTexto(escreveu: boolean) {
        ultimoTexto.current = escreveu ? texto.trim() : '';
        if (escreveu) {
            setMensagens((m) => [...m, novaMensagem('crianca', ultimoTexto.current)]);
        }
        setTexto('');
        setEtapa('enviando');
        enviarCheckin();
    }

    // Envia o check-in ao backend (usa os controllers que já existiam)
    async function enviarCheckin() {
        try {
            const pet = await buscarPrimeiroPet();
            if (!pet || !humorEscolhido) throw new Error('Sem pet ou sem humor');
            await enviarCheckinHumor({
                usuario_id: pet.usuario,
                emoji: humorEscolhido,
                texto_livre: ultimoTexto.current,
            });
            await nuvinhaFala([agradecimento(ultimoTexto.current !== '')]);
            setEtapa('fim');
        } catch (erro) {
            console.log('Erro ao enviar check-in:', erro);
            await nuvinhaFala(['Ops, não consegui guardar agora. Vamos tentar de novo?']);
            setEtapa('erro');
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Topo: a Nuvinha, sempre visível */}
            <View style={[styles.topo, {paddingTop: insets.top + 8}]}>
                <NuvinhaPet humor={humorPet} size={96}/>
                <Text style={styles.nome}>Nuvinha</Text>
                <Text style={styles.status}>conversando com você</Text>
            </View>

            {/* Lista de balões: rola sozinha para a mensagem mais nova */}
            <ScrollView
                ref={scrollRef}
                style={styles.lista}
                contentContainerStyle={styles.listaConteudo}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({animated: true})}
            >
                {mensagens.map((m) => (
                    <BalaoMensagem key={m.id} mensagem={m}/>
                ))}
                {digitando && <DigitandoIndicador/>}
            </ScrollView>

            {/* Parte de baixo: muda conforme a etapa da conversa */}
            <View style={styles.rodape}>
                {etapa === 'humor' && mostrarOpcoes && (
                    <View style={styles.humorLinha}>
                        {HUMORES.map((h) => (
                            <Pressable
                                key={h.emoji}
                                style={styles.humorChip}
                                onPress={() => escolherHumor(h)}
                                accessibilityRole="button"
                                accessibilityLabel={h.label}
                            >
                                <Text style={styles.humorEmoji}>{h.emoji}</Text>
                                <Text style={styles.humorLabel}>{h.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {etapa === 'texto' && (
                    <View>
                        <Text style={styles.aviso}>{AVISO_PRIVACIDADE}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Escreve pra mim..."
                            placeholderTextColor="#A99FB8"
                            value={texto}
                            onChangeText={setTexto}
                            multiline
                            maxLength={500}
                        />
                        <Pressable
                            style={[styles.botao, texto.trim() === '' && styles.botaoDesabilitado]}
                            disabled={texto.trim() === ''}
                            onPress={() => aoResponderTexto(true)}
                        >
                            <Text style={styles.botaoTexto}>Enviar</Text>
                        </Pressable>
                        <Pressable style={styles.botaoSecundario} onPress={() => aoResponderTexto(false)}>
                            <Text style={styles.botaoSecundarioTexto}>Prefiro não contar agora</Text>
                        </Pressable>
                    </View>
                )}

                {etapa === 'enviando' && <ActivityIndicator color="#FF8C7A"/>}

                {etapa === 'erro' && (
                    <Pressable style={styles.botao} onPress={() => {
                        setEtapa('enviando');
                        enviarCheckin();
                    }}>
                        <Text style={styles.botaoTexto}>Tentar de novo</Text>
                    </Pressable>
                )}

                {etapa === 'fim' && (
                    <Pressable style={styles.botao} onPress={iniciarConversa}>
                        <Text style={styles.botaoTexto}>Conversar de novo</Text>
                    </Pressable>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#EAF6F6'},
    topo: {alignItems: 'center', paddingBottom: 8},
    nome: {fontSize: 18, fontWeight: '700', color: '#3D3050'},
    status: {fontSize: 12, color: '#7C6E8C'},
    lista: {flex: 1},
    listaConteudo: {padding: 16},
    rodape: {padding: 16, minHeight: 90, justifyContent: 'center'},
    humorLinha: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
    humorChip: {
        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 12,
        alignItems: 'center', minHeight: 64,
    },
    humorEmoji: {fontSize: 24},
    humorLabel: {fontSize: 11, fontWeight: '700', color: '#3D3050', marginTop: 4},
    aviso: {fontSize: 12, color: '#7C6E8C', marginBottom: 8, textAlign: 'center'},
    input: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, minHeight: 64,
        maxHeight: 120, fontSize: 16, color: '#3D3050', textAlignVertical: 'top',
    },
    botao: {
        backgroundColor: '#FF8C7A', borderRadius: 24, paddingVertical: 14,
        alignItems: 'center', marginTop: 10,
    },
    botaoDesabilitado: {opacity: 0.45},
    botaoTexto: {color: '#FFFFFF', fontWeight: '700', fontSize: 16},
    botaoSecundario: {paddingVertical: 12, alignItems: 'center'},
    botaoSecundarioTexto: {color: '#F16B57', fontWeight: '700', fontSize: 14},
});
