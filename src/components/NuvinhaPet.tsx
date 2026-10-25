// VIEW (componente visual): desenha a Nuvinha usando SVG, no
// estilo de nuvem fofinha da referência de design que você mandou
// — nuvem branca, olhinhos fechados de felicidade, bochechas rosadas.
//
// Por que SVG e não uma imagem (PNG)?
// - É vetorial: fica nítido em qualquer tamanho de tela, sem pesar o app.
// - Dá pra mudar cor/expressão via código (ex: aura muda com o humor)
//   sem precisar desenhar uma imagem nova pra cada variação.

import React, { useEffect } from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Define quais propriedades esse componente aceita de fora.
// TypeScript nos avisa se esquecermos de passar algo obrigatório.
type NuvinhaPetProps = {
  humor?: 'feliz' | 'neutro' | 'triste'; // controla a cor da aura
  size?: number; // tamanho do desenho, em pixels
};

export default function NuvinhaPet({ humor = 'feliz', size = 180 }: NuvinhaPetProps) {
  // "shared value": a variável que o Reanimated observa pra animar.
  // Começa em 1 (tamanho normal) e vai oscilar até 1.05 e voltar,
  // criando o efeito de "respiração" da nuvem.
  const scale = useSharedValue(1);

  useEffect(() => {
    // withRepeat(-1, true) = repete pra sempre, alternando ida e volta
    // (sobe até 1.05, desce até 1, sobe de novo... sem "piscar" ao reiniciar).
    scale.value = withRepeat(
      withTiming(1.05, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Transforma o número "scale" numa transformação visual de verdade.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // A cor da aura muda conforme o humor — mesma ideia do protótipo HTML:
  // o dado que a criança registra se reflete visualmente no bichinho.
  const corAura = {
    feliz: '#6FCF97',   // verde suave
    neutro: '#B695C0',  // lilás
    triste: '#7FB8E8',  // azul mais frio
  }[humor];

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Aura: círculo grande e semitransparente atrás da nuvem */}
        <Circle cx="100" cy="100" r="90" fill={corAura} opacity={0.25} />

        {/* Corpo da nuvem: várias formas sobrepostas criam o
            contorno "fofinho" de nuvem, em vez de um círculo único */}
        <Ellipse cx="100" cy="120" rx="55" ry="38" fill="#FFFFFF" />
        <Circle cx="65" cy="100" r="30" fill="#FFFFFF" />
        <Circle cx="100" cy="85" r="38" fill="#FFFFFF" />
        <Circle cx="135" cy="100" r="30" fill="#FFFFFF" />

        {/* Bochechas rosadas — o toque fofo da referência */}
        <Circle cx="78" cy="118" r="9" fill="#FFC2C2" opacity={0.8} />
        <Circle cx="122" cy="118" r="9" fill="#FFC2C2" opacity={0.8} />

        {/* Olhos fechados e felizes, em formato de "^ ^",
            feitos com curvas (Path) em vez de círculos */}
        <Path d="M80 108 Q85 100 90 108" stroke="#3D3050" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M110 108 Q115 100 120 108" stroke="#3D3050" strokeWidth={3} strokeLinecap="round" fill="none" />

        {/* Sorriso pequeno */}
        <Path d="M92 122 Q100 128 108 122" stroke="#3D3050" strokeWidth={3} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}