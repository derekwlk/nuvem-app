// VIEW: um balão de conversa. Os da Nuvinha ficam à esquerda (brancos);
// os da criança ficam à direita (coral).
import { View, Text, StyleSheet } from 'react-native';
import { Mensagem } from '@/models/Mensagem';

export default function BalaoMensagem({ mensagem }: { mensagem: Mensagem }) {
  const daNuvinha = mensagem.autor === 'nuvinha';
  return (
    // a linha inteira alinha o balão para a esquerda ou para a direita
    <View style={[styles.linha, daNuvinha ? styles.esquerda : styles.direita]}>
      <View style={[styles.balao, daNuvinha ? styles.balaoNuvinha : styles.balaoCrianca]}>
        <Text style={[styles.texto, !daNuvinha && styles.textoCrianca]}>
          {mensagem.texto}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', marginBottom: 8 },
  esquerda: { justifyContent: 'flex-start' },
  direita: { justifyContent: 'flex-end' },
  balao: { maxWidth: '82%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
  // o "bico" do balão: o canto perto de quem fala fica menos arredondado
  balaoNuvinha: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  balaoCrianca: { backgroundColor: '#FF8C7A', borderBottomRightRadius: 4 },
  texto: { fontSize: 16, lineHeight: 22, color: '#3D3050' },
  textoCrianca: { color: '#FFFFFF', fontWeight: '600' },
});