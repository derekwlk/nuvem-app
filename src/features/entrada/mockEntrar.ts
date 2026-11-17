// mockEntrar.ts — simula o backend, só para testar a tela
import type { ResultadoEntrada } from "./tipos";

export async function mockEntrar(codigo: string): Promise<ResultadoEntrada> {
  // Finge que o sistema está verificando o código.
  await new Promise((r) => setTimeout(r, 800));

  // Código válido para os testes.
  if (codigo === "NUVEM1") {
    return { ok: true, apelido: "Amigo(a)" };
  }

  // Resposta para qualquer código diferente.
  return {
    ok: false,
    mensagem: "Não achei esse código. Confira com o adulto que te ajuda.",
  };
}
