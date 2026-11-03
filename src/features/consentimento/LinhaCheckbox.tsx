
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { COLORS } from './cores';

interface LinhaCheckboxProps {
  marcado: boolean;
  texto: string;
  onAlternar: () => void;
}

export default function LinhaCheckbox({
  marcado,
  texto,
  onAlternar,
}: LinhaCheckboxProps) {
  return (
    <TouchableOpacity
      style={styles.linha}
      onPress={onAlternar}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado }}
      accessibilityLabel={texto}
    >
      {/* A marca mostra visualmente o estado da seleção. */}
      <View
        style={[
          styles.caixa,
          marcado && styles.caixaMarcada,
        ]}
      >
        {marcado && <Text style={styles.check}>✓</Text>}
      </View>

      <Text style={styles.texto}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  linha: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  caixa: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lavanda,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaMarcada: {
    backgroundColor: COLORS.mentaEscura,
    borderColor: COLORS.mentaEscura,
  },
  check: {
    color: COLORS.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  texto: {
    flex: 1,
    color: COLORS.textoPrincipal,
    fontSize: 15,
    lineHeight: 22,
  },
});
