
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { COLORS, SOMBRA } from './cores';

interface AvisoAdultoProps {
  onContinuar: () => void;
}

export default function AvisoAdulto({
  onContinuar,
}: AvisoAdultoProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conteudo}>
        {/* Identifica que esta é uma demonstração. */}
        <Text style={styles.etiqueta}>
          DEMONSTRAÇÃO · dados fictícios
        </Text>

        {/* Ícone de escudo em um círculo branco. */}
        <View style={styles.circulo}>
          <Text style={styles.icone}>🛡️</Text>
        </View>

        {/* Explica que esta etapa é destinada ao adulto. */}
        <Text style={styles.titulo}>
          Esta parte é para o adulto responsável
        </Text>

        {/* Orienta a criança a entregar o aparelho ao adulto. */}
        <View style={styles.cartao}>
          <Text style={styles.mensagem}>
            Entregue o aparelho a um adulto para ler e
            autorizar o uso do aplicativo.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botao}
          onPress={onContinuar}
          accessibilityRole="button"
          accessibilityLabel="Sou o adulto responsável"
        >
          <Text style={styles.textoBotao}>
            Sou o adulto responsável
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.fundoSuave,
  },
  conteudo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  etiqueta: {
    color: COLORS.coralEscuro,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
  },
  circulo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SOMBRA,
  },
  icone: {
    fontSize: 48,
  },
  titulo: {
    color: COLORS.textoPrincipal,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  cartao: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    ...SOMBRA,
  },
  mensagem: {
    color: COLORS.textoSecundario,
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
  },
  botao: {
    width: '100%',
    minHeight: 52,
    borderRadius: 28,
    backgroundColor: COLORS.coral,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  textoBotao: {
    color: COLORS.textoPrincipal,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
