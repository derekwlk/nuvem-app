import { useState } from "react";
import { Alert } from "react-native";

import Apresentacao from "./Apresentacao";
import BoasVindas from "./BoasVindas";
import TelaCodigo from "./TelaCodigo";

import type { EntradaProps, ResultadoEntrada } from "./tipos";

type Passo = "boasVindas" | "codigo" | "apresentacao";

export default function EntradaFlow({ onEntrar, onConcluir }: EntradaProps) {
  const [passo, setPasso] = useState<Passo>("boasVindas");
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [apelido, setApelido] = useState("");

  // Avança da tela inicial para a tela de código.
  function iniciar() {
    setPasso("codigo");
  }

  // Volta para a tela inicial e limpa o estado do código.
  function voltar() {
    setCodigo("");
    setErro("");
    setPasso("boasVindas");
  }

  // Mostra como conseguir um código de acesso.
  function mostrarAjuda() {
    Alert.alert(
      "Precisa de ajuda?",
      "Peça ajuda ao psicólogo(a), assistente social ou responsável que cuida de você. Eles têm o seu código.",
      [{ text: "Entendi" }],
    );
  }

  // Verifica o código informado.
  async function entrar() {
    if (codigo.length !== 6 || carregando) {
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const resultado: ResultadoEntrada = await onEntrar(codigo);

      if (resultado.ok) {
        setApelido(resultado.apelido || "Amigo(a)");
        setPasso("apresentacao");
      } else {
        setErro(
          resultado.mensagem ||
            "Não consegui verificar seu código. Tente novamente.",
        );
      }
    } catch {
      setErro("Não consegui verificar seu código agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // Exibe a tela correspondente à etapa atual.
  if (passo === "boasVindas") {
    return <BoasVindas onComecar={iniciar} />;
  }

  if (passo === "codigo") {
    return (
      <TelaCodigo
        codigo={codigo}
        onChangeCodigo={(novoCodigo) => {
          setCodigo(novoCodigo);
          setErro("");
        }}
        onEntrar={entrar}
        onVoltar={voltar}
        onAjuda={mostrarAjuda}
        carregando={carregando}
        erro={erro}
      />
    );
  }

  return <Apresentacao apelido={apelido} onConcluir={onConcluir} />;
}
