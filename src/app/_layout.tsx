import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import ConsentimentoGate from '@/components/ConsentimentoGate';
import { WalletProvider } from '@/context/WalletContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
