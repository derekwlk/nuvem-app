// MODEL: o formato de uma mensagem dentro da conversa.
// Não tem lógica nenhuma, só descreve os campos.

// Quem escreveu a mensagem: a Nuvinha ou a criança
export type Autor = 'nuvinha' | 'crianca';

export interface Mensagem {
  id: string;     // identificador único (o React precisa disso para listas)
  autor: Autor;
  texto: string;
}