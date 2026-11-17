
/**
 * Textos provisórios dos cartões informativos.
 * Devem ser revisados pela orientação antes de uso real.
 */
export const CARTOES = [
  {
    id: 'finalidade',
    icone: '?',
    titulo: 'Para que usamos',
    texto:
      'O Nuvinha é um bichinho virtual que ajuda profissionais a ' +
      'acompanhar como a criança se sente no dia a dia.',
  },
  {
    id: 'dados',
    icone: 'i',
    titulo: 'Quais informações',
    texto:
      'Um apelido (não pedimos o nome completo), a idade, o humor que ' +
      'a criança escolhe, o que ela escreve para a Nuvinha e o que jogou.',
  },
  {
    id: 'quem',
    icone: '◉',
    titulo: 'Quem pode ver',
    texto:
      'Somente o profissional responsável pelo acompanhamento da ' +
      'criança. Análises coletivas usam dados juntos, sem identificar ninguém.',
  },
  {
    id: 'limites',
    icone: '!',
    titulo: 'O que o aplicativo não faz',
    texto:
      'Não faz diagnóstico e não substitui o atendimento profissional. ' +
      'Os dados não são vendidos nem usados para propaganda.',
  },
  {
    id: 'direitos',
    icone: '✓',
    titulo: 'Seus direitos',
    texto:
      'Você pode pedir para ver, corrigir ou apagar os dados da criança ' +
      'e retirar este consentimento quando quiser, falando com o ' +
      'profissional responsável.',
  },
];

/**
 * Termo completo que será exibido quando o usuário tocar
 * em "Ler o termo completo".
 */
export const TERMO_COMPLETO =
  'Em cumprimento à Lei Geral de Proteção de Dados Pessoais (Lei nº ' +
  '13.709/2018), art. 14, o tratamento de dados de crianças e adolescentes ' +
  'depende de consentimento específico e em destaque dado por, pelo menos, ' +
  'um dos pais ou pelo responsável legal, e deve ocorrer no melhor interesse ' +
  'da criança. Ao concordar, você autoriza o uso do aplicativo Nuvinha pela ' +
  'criança sob sua responsabilidade e o tratamento dos dados descritos nesta ' +
  'tela, exclusivamente para apoiar o acompanhamento socioemocional por ' +
  'profissional vinculado. Você pode revogar esta autorização a qualquer ' +
  'momento. Nesta versão de demonstração, nenhum dado real é coletado.';
