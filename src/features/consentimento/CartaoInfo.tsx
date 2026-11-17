
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS, SOMBRA } from './cores';

interface CartaoInfoProps {
  icone: string;
  titulo: string;
  texto: string;
}

export default function CartaoInfo({
  icone,
  titulo,
  texto,
}: CartaoInfoProps) {
  return (
    <View style={styles.cartao}>
      {/* Ícone e título aparecem lado a lado. */}
      <View style={styles.cabecalho}>
        <View style={styles.circulo}>
          <Text style={styles.icone}>{icone}</Text>
        </View>

        <Text style={styles.titulo}>{titulo}</Text>
      </View>

      {/* Texto explicativo do cartão. */}
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    ...SOMBRA,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  circulo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.fundoSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icone: {
    color: COLORS.coralEscuro,
    fontSize: 20,
    fontWeight: 'bold',
  },
  titulo: {
    flex: 1,
    color: COLORS.textoPrincipal,
    fontSize: 16,
    fontWeight: 'bold',
  },
  texto: {
    color: COLORS.textoSecundario,
    fontSize: 15,
    lineHeight: 23,
  },
});

