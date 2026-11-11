import NuvinhaPet from "@/components/NuvinhaPet";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SOMBRA } from "./cores";

interface BoasVindasProps {
  onComecar: () => void;
}

export default function BoasVindas({ onComecar }: BoasVindasProps) {
  return (
    <View style={styles.container}>
      <View style={styles.conteudo}>
        <NuvinhaPet humor="feliz" size={150} />

        <Text style={styles.titulo}>Oi! Eu sou a Nuvinha</Text>

        <Text style={styles.subtitulo}>Vamos ser amigos?</Text>

        <TouchableOpacity
          style={styles.botao}
          onPress={onComecar}
          accessibilityRole="button"
          accessibilityLabel="Começar"
        >
          <Text style={styles.textoBotao}>Começar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.rodape}>
        Para crianças e jovens, com a ajuda de um adulto
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.fundoSuave,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  conteudo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  titulo: {
    color: COLORS.textoPrincipal,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 24,
  },
  subtitulo: {
    color: COLORS.textoSecundario,
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  botao: {
    backgroundColor: COLORS.coral,
    borderRadius: 30,
    minHeight: 52,
    width: "100%",
    maxWidth: 320,
    justifyContent: "center",
    alignItems: "center",
    ...SOMBRA,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  rodape: {
    color: COLORS.textoSecundario,
    fontSize: 14,
    textAlign: "center",
  },
});
