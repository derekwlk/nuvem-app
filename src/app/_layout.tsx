import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useEffect } from 'react';
import { iniciarSincronizacaoAutomatica } from '@/services/sincronizacao';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

 // Assim que a internet voltar, os check-ins pendentes são enviados
  useEffect(() => {
    const parar = iniciarSincronizacaoAutomatica();
    return parar;               // desliga a escuta ao fechar
  }, []);
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );

   
}
