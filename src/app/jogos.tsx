import { View, Text, StyleSheet } from 'react-native';

export default function TelaConversar() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Tela Conversar (em construção)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  texto: { fontSize: 18, color: '#3D3050' },
});