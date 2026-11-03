// CONTROLLER: a "cabeça" da conversa. Guarda as falas da Nuvinha e decide
// qual fala usar. A tela (View) só pede: "me dá a resposta para este humor".
import { Autor, Mensagem } from '../models/Mensagem';

// Cores da aura do bichinho (o NuvinhaPet já aceita estes três valores)
export type HumorPet = 'feliz' | 'neutro' | 'triste';

// Opções que a criança pode tocar. "humorPet" diz como a Nuvinha reage.
export const HUMORES = [
  { emoji: '😄', label: 'Feliz', humorPet: 'feliz' as HumorPet },
  { emoji: '😐', label: 'Normal', humorPet: 'neutro' as HumorPet },
  { emoji: '😔', label: 'Triste', humorPet: 'triste' as HumorPet },
  { emoji: '😟', label: 'Com medo', humorPet: 'triste' as HumorPet },
];

// Cria uma mensagem nova com um id único
export function novaMensagem(autor: Autor, texto: string): Mensagem {
  return { id: `${Date.now()}-${Math.random()}`, autor, texto };
}

// Falas de abertura (a Nuvinha manda uma de cada vez)
export const SAUDACAO = [
  'Oi! Que bom te ver de novo! 💛',
  'Como foi o seu dia hoje?',
];

// Resposta da Nuvinha conforme o humor escolhido
const RESPOSTAS: Record<string, string[]> = {
  '😄': ['Que bom! Fico muito feliz de saber disso! 🌟'],
  '😐': ['Entendi. Dias normais também são importantes. 🌤️'],
  '😔': ['Poxa, sinto muito que o seu dia não foi tão bom. Estou aqui com você. 💙'],
  '😟': [
    'Obrigada por me contar. Sentir medo acontece com todo mundo, e você foi corajoso(a) de falar. 💛',
    'Se quiser, você também pode contar para um adulto de confiança.',
  ],
};

export function respostaAoHumor(emoji: string): string[] {
  return RESPOSTAS[emoji] ?? ['Obrigada por me contar! 💛'];
}

// Convite para escrever e aviso honesto de privacidade
export const CONVITE_TEXTO =
  'Quer me contar mais sobre o seu dia? Pode escrever aqui. Se preferir não contar agora, tudo bem!';
export const AVISO_PRIVACIDADE =
  'O adulto que cuida de você (como o seu psicólogo ou psicóloga) pode ler o que você escreve aqui, para ajudar você.';

export function agradecimento(escreveu: boolean): string {
  return escreveu
    ? 'Obrigada por me contar! Quando quiser conversar de novo, estou aqui. 💛'
    : 'Tudo bem! Obrigada por me dizer como você está. Quando quiser, estou aqui. 💛';
}