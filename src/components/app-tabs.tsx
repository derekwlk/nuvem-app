// VIEW: define as 4 abas do app (a barra de navegação de baixo).
// Trocamos o "NativeTabs" experimental pelo "Tabs" padrão do Expo Router,
// que é estável e usa ícones vetoriais em vez de exigir imagens PNG prontas.

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Cada Tabs.Screen aqui corresponde a um arquivo dentro de src/app/
          com o mesmo "name". O Expo Router liga isso automaticamente. */}
      <Tabs.Screen
        name="index" // arquivo: src/app/index.tsx (nossa tela Cuidar)
        options={{
          title: 'Cuidar',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="conversar" // arquivo: src/app/conversar.tsx
        options={{
          title: 'Conversar',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jogos" // arquivo: src/app/jogos.tsx
        options={{
          title: 'Jogos',
          tabBarIcon: ({ color, size }) => <Ionicons name="game-controller" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="loja" // arquivo: src/app/loja.tsx
        options={{
          title: 'Loja',
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}