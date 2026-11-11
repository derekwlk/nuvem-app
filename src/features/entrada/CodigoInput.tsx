import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "./cores";

interface CodigoInputProps {
  value: string;
  onChangeText: (codigo: string) => void;
  disabled?: boolean;
  erro?: boolean;
}

export default function CodigoInput({
  value,
  onChangeText,
  disabled = false,
  erro = false,
}: CodigoInputProps) {
  const [focado, setFocado] = useState(false);
  const deslocamento = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!erro) return;

    deslocamento.setValue(0);

    Animated.sequence([
      Animated.timing(deslocamento, {
        toValue: -12,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(deslocamento, {
        toValue: 12,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(deslocamento, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(deslocamento, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(deslocamento, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [erro, deslocamento]);

  function atualizarCodigo(texto: string) {
    const codigo = texto
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    onChangeText(codigo);
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.caixas, { transform: [{ translateX: deslocamento }] }]}
      >
        {Array.from({ length: 6 }).map((_, index) => {
          const caractere = value[index] || "";
          const caixaAtiva = focado && index === value.length;

          return (
            <View
              key={index}
              style={[
                styles.caixa,
                caixaAtiva && styles.caixaAtiva,
                disabled && styles.caixaDesabilitada,
                erro && styles.caixaErro,
              ]}
            >
              <Text style={styles.caractere}>{caractere}</Text>
            </View>
          );
        })}
      </Animated.View>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={atualizarCodigo}
        maxLength={6}
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        editable={!disabled}
        caretHidden
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        accessibilityLabel="Digite seu código de seis letras e números"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 340,
    position: "relative",
    justifyContent: "center",
  },
  caixas: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  caixa: {
    flex: 1,
    height: 56,
    maxWidth: 48,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.trilho,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  caixaAtiva: {
    borderColor: COLORS.coral,
  },
  caixaDesabilitada: {
    opacity: 0.5,
  },
  caixaErro: {
    borderColor: COLORS.coralEscuro,
  },
  caractere: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textoPrincipal,
  },
  input: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0,
    color: "transparent",
  },
});
