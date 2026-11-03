// VIEW: as três bolinhas "digitando..." que dão a sensação de que a
// Nuvinha está pensando antes de falar.
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay,
} from 'react-native-reanimated';

// Cada bolinha pisca com um pequeno atraso em relação à anterior
function Bolinha({ atraso }: { atraso: number }) {
  const opacidade = useSharedValue(0.3);
  useEffect(() => {
    opacidade.value = withDelay(
      atraso,
      withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
        -1, // -1 = repete para sempre
        false,
      ),
    );
  }, []);
  const estilo = useAnimatedStyle(() => ({ opacity: opacidade.value }));
  return <Animated.View style={[styles.bolinha, estilo]} />;
}

export default function DigitandoIndicador() {
  return (
    <View style={styles.linha}>
      <View style={styles.balao}>
        <Bolinha atraso={0} />
        <Bolinha atraso={200} />
        <Bolinha atraso={400} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', marginBottom: 8 },
  balao: {
    flexDirection: 'row', gap: 6, backgroundColor: '#FFFFFF', paddingVertical: 14,
    paddingHorizontal: 16, borderRadius: 18, borderBottomLeftRadius: 4,
  },
  bolinha: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C6E8C' },
});