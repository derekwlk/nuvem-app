/**
 * TabPagerContext – extracted to break the circular dependency between
 * TabPager.tsx (which imports screens) and the screens (which import useTabPager).
 */
import {createContext, useContext} from 'react';

export type TabKey = 'cuidar' | 'conversar' | 'jogos' | 'loja';
export const TAB_KEYS: TabKey[] = ['cuidar', 'conversar', 'jogos', 'loja'];

export type TabPagerContextType = {
  activeTab: TabKey;
  goToTab: (tab: TabKey) => void;
  setSwipeEnabled: (enabled: boolean) => void;
  setTabBarVisible: (visible: boolean) => void;
};

export const TabPagerContext = createContext<TabPagerContextType>({
  activeTab: 'cuidar',
  goToTab: () => {},
  setSwipeEnabled: () => {},
  setTabBarVisible: () => {},
});

export const useTabPager = () => useContext(TabPagerContext);
