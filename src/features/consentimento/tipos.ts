
/**
 * Define os dados enviados quando o responsável aceita
 * o termo de consentimento.
 */
export interface DadosConsentimento {
  nomeResponsavel: string;
  aceiteUso: boolean;
  aceiteCrianca: boolean;
}

/**
 * Define as funções que a tela recebe do aplicativo.
 */
export interface ConsentimentoProps {
  onAceitar: (dados: DadosConsentimento) => void;
  onRecusar: () => void;
}
