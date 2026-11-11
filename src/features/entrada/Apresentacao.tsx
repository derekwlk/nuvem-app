import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import NuvinhaPet from "@/components/NuvinhaPet";
import { COLORS, SOMBRA } from "./cores";

interface ApresentacaoProps {
  apelido: string;
  onConcluir: () => void;
}

export default function Apresentacao({
  apelido,
  onConcluir,
}: ApresentacaoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.conteudo}>
        <View style={styles.mascoteContainer}>
          <View style={styles.circuloMenta} />
          <NuvinhaPet humor="feliz" size={150} />
        </View>

        <Text style={styles.titulo}>Oi, {apelido}!</Text>

        <View style={styles.card}>
          <Text style={styles.textoCard}>
            Aqui você cuida de mim, joga e pode me contar como foi o seu dia.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botao}
          onPress={onConcluir}
          accessibilityRole="button"
          accessibilityLabel="Vamos brincar"
        >
          <Text style={styles.textoBotao}>Vamos brincar!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.fundoSuave,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  conteudo: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  mascoteContainer: {
    width: 190,
    height: 190,
    justifyContent: "center",
    alignItems: "center",
  },
  circuloMenta: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: COLORS.menta,
    opacity: 0.35,
  },
  titulo: {
    color: COLORS.textoPrincipal,
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
    ...SOMBRA,
  },
  textoCard: {
    color: COLORS.textoPrincipal,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  botao: {
    backgroundColor: COLORS.coral,
    borderRadius: 30,
    minHeight: 52,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    ...SOMBRA,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
