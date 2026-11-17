
import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import ConsentimentoGate from '@/components/ConsentimentoGate';
import { WalletProvider } from '@/context/WalletContext';
import { iniciarSincronizacaoAutomatica } from '@/services/sincronizacao';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Assim que a internet voltar, os check-ins pendentes são enviados
  useEffect(() => {
    const parar = iniciarSincronizacaoAutomatica();
    return parar;
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <ConsentimentoGate>
        <WalletProvider>
          <Slot />
        </WalletProvider>
      </ConsentimentoGate>
    </ThemeProvider>
  );
}
