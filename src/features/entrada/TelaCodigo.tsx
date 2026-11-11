import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import NuvinhaPet from "@/components/NuvinhaPet";
import CodigoInput from "./CodigoInput";
import { COLORS, SOMBRA } from "./cores";

interface TelaCodigoProps {
  codigo: string;
  onChangeCodigo: (codigo: string) => void;
  onEntrar: () => void;
  onVoltar: () => void;
  onAjuda: () => void;
  carregando: boolean;
  erro: string;
}

export default function TelaCodigo({
  codigo,
  onChangeCodigo,
  onEntrar,
  onVoltar,
  onAjuda,
  carregando,
  erro,
}: TelaCodigoProps) {
  const codigoCompleto = codigo.length === 6;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={onVoltar}
          disabled={carregando}
          accessibilityLabel="Voltar"
        >
          <Text style={styles.textoVoltar}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.ilustracao}>
          <NuvinhaPet />
        </View>

        <Text style={styles.titulo}>Qual é o seu código?</Text>

        <Text style={styles.subtitulo}>
          Digite o código de 6 letras e números que recebeu de quem cuida de
          você.
        </Text>

        <View style={styles.areaCodigo}>
          <CodigoInput
            value={codigo}
            onChangeText={onChangeCodigo}
            disabled={carregando}
            erro={Boolean(erro)}
          />

          <Text style={styles.dica}>O código tem 6 caracteres.</Text>

          {erro ? (
            <Text style={styles.textoErro} accessibilityRole="alert">
              {erro}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.botaoEntrar,
            (!codigoCompleto || carregando) && styles.botaoDesabilitado,
          ]}
          onPress={onEntrar}
          disabled={!codigoCompleto || carregando}
          activeOpacity={0.8}
        >
          {carregando ? (
            <View style={styles.conteudoBotao}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.textoBotao}>Entrando...</Text>
            </View>
          ) : (
            <Text style={styles.textoBotao}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoAjuda}
          onPress={onAjuda}
          disabled={carregando}
        >
          <Text style={styles.textoAjuda}>Não tenho código</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.fundoSuave,
  },
  conteudo: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
  },
  botaoVoltar: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  textoVoltar: {
    color: COLORS.textoPrincipal,
    fontSize: 16,
    fontWeight: "600",
  },
  ilustracao: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  titulo: {
    color: COLORS.textoPrincipal,
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitulo: {
    color: COLORS.textoSecundario,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 32,
  },
  areaCodigo: {
    width: "100%",
    alignItems: "center",
  },
  dica: {
    color: COLORS.textoSecundario,
    fontSize: 13,
    marginTop: 12,
  },
  textoErro: {
    color: COLORS.coralEscuro,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  botaoEntrar: {
    width: "100%",
    maxWidth: 340,
    minHeight: 54,
    backgroundColor: COLORS.coral,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    ...SOMBRA,
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  conteudoBotao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  botaoAjuda: {
    padding: 16,
    marginTop: 8,
  },
  textoAjuda: {
    color: COLORS.textoPrincipal,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
