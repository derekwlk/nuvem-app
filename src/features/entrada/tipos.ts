// Define o resultado que será devolvido após tentar entrar.
export interface ResultadoEntrada {
  ok: boolean;
  apelido?: string;
  mensagem?: string;
}

// Define as funções que o fluxo de entrada recebe.
export interface EntradaProps {
  onEntrar: (codigo: string) => Promise<ResultadoEntrada>;
  onConcluir: () => void;
}
