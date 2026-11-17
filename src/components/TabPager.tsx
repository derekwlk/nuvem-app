/**
 * TabPager – Android-style horizontal pager with:
 *  - Real-time 1:1 drag tracking (hold between pages freely)
 *  - Smooth inertia snap on release
 *  - Animated indicator that follows scroll pixel-for-pixel
 *  - Tab icon/label update on snap
 */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {
  TabKey,
  TAB_KEYS,
  TabPagerContext,
  TabPagerContextType,
} from '@/components/TabPagerContext';
export type {TabKey};
export {TAB_KEYS, useTabPager} from '@/components/TabPagerContext';
import TelaCuidar from '@/screens/TelaCuidar';
import TelaConversar from '@/screens/TelaConversar';
import TelaJogos from '@/screens/TelaJogos';
import TelaLoja from '@/screens/TelaLoja';

// ─── Tab definitions ─────────────────────────────────────────────────────────
type TabDef = {
  key: TabKey;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const TABS: TabDef[] = [
  {key: 'cuidar',    title: 'Cuidar',    icon: 'home',               iconOutline: 'home-outline'},
  {key: 'conversar', title: 'Conversar', icon: 'chatbubble-ellipses', iconOutline: 'chatbubble-ellipses-outline'},
  {key: 'jogos',     title: 'Jogos',     icon: 'game-controller',     iconOutline: 'game-controller-outline'},
  {key: 'loja',      title: 'Loja',      icon: 'storefront',          iconOutline: 'storefront-outline'},
];

const ACTIVE_COLOR    = '#7361A1';
const INACTIVE_COLOR  = '#A89FC1';
const INDICATOR_COLOR = '#8F7BC9';
const N               = TABS.length;

// ─── Component ───────────────────────────────────────────────────────────────
export default function TabPager({initialTab = 'cuidar'}: {initialTab?: TabKey}) {
  const {width}  = useWindowDimensions();
  const insets   = useSafeAreaInsets();
  const initialIndex = Math.max(0, TAB_KEYS.indexOf(initialTab));

  // Mutable state
  const [activeIndex,   setActiveIndex]   = useState(initialIndex);
  const [swipeEnabled,  setSwipeEnabled]  = useState(true);
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const activeIndexRef   = useRef(initialIndex);
  const isLayoutReady    = useRef(false);

  // Ref for the underlying ScrollView inside Animated.ScrollView
  const scrollRef = useRef<Animated.AnimatedComponent<React.ComponentClass<any>>>(null);

  // The animated value that tracks contentOffset.x in real time (no native driver
  // because we need JS interpolations for the indicator).
  const scrollX = useRef(new Animated.Value(initialIndex * Math.max(width, 375))).current;

  // ── Navigation helper ──────────────────────────────────────────────────────
  const goToTab = useCallback(
    (key: TabKey) => {
      const index = TAB_KEYS.indexOf(key);
      if (index === -1 || width <= 0) return;
      activeIndexRef.current = index;
      setActiveIndex(index);
      (scrollRef.current as any)?.scrollTo({x: index * width, animated: true});
    },
    [width],
  );

  // ── Scroll handler (real-time + page snap detection) ──────────────────────
  const onScrollEvent = Animated.event(
    [{nativeEvent: {contentOffset: {x: scrollX}}}],
    {
      useNativeDriver: false,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (width <= 0) return;
        const page = Math.round(e.nativeEvent.contentOffset.x / width);
        const clamped = Math.max(0, Math.min(N - 1, page));
        if (clamped !== activeIndexRef.current) {
          activeIndexRef.current = clamped;
          setActiveIndex(clamped);
        }
      },
    },
  );

  // ── Layout init (scroll to correct page without animation) ────────────────
  const onLayout = () => {
    if (!isLayoutReady.current && width > 0) {
      isLayoutReady.current = true;
      if (initialIndex > 0) {
        (scrollRef.current as any)?.scrollTo({x: initialIndex * width, animated: false});
      }
    }
  };

  // Re-snap on orientation change
  useEffect(() => {
    if (isLayoutReady.current && width > 0) {
      (scrollRef.current as any)?.scrollTo({
        x: activeIndexRef.current * width,
        animated: false,
      });
    }
  }, [width]);

  // ── Animated indicator ────────────────────────────────────────────────────
  // Guard against width === 0 to keep inputRange strictly ascending
  const safeWidth = Math.max(width, 1);
  const tabWidth  = safeWidth / N;

  // indicator translateX moves from 0 → (N-1)*tabWidth as scrollX goes 0 → (N-1)*safeWidth
  const indicatorTranslateX = scrollX.interpolate({
    inputRange:   TAB_KEYS.map((_, i) => i * safeWidth),
    outputRange:  TAB_KEYS.map((_, i) => i * tabWidth),
    extrapolate:  'clamp',
  });

  // ── Context ───────────────────────────────────────────────────────────────
  const contextValue: TabPagerContextType = {
    activeTab: TAB_KEYS[activeIndex] ?? 'cuidar',
    goToTab,
    setSwipeEnabled,
    setTabBarVisible,
  };

  return (
    <TabPagerContext.Provider value={contextValue}>
      <View style={styles.container} onLayout={onLayout}>

        {/* ── Horizontal pager ── */}
        <Animated.ScrollView
          ref={scrollRef as any}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"          // Android: no overscroll glow
          scrollEventThrottle={1}         // fire every frame for smooth indicator
          scrollEnabled={swipeEnabled}
          onScroll={onScrollEvent}
          style={styles.pager}
          keyboardShouldPersistTaps="handled"
          decelerationRate={Platform.OS === 'android' ? 0.9 : 'fast'}
        >
          <View style={[styles.page, {width: safeWidth}]}><TelaCuidar /></View>
          <View style={[styles.page, {width: safeWidth}]}><TelaConversar /></View>
          <View style={[styles.page, {width: safeWidth}]}><TelaJogos /></View>
          <View style={[styles.page, {width: safeWidth}]}><TelaLoja /></View>
        </Animated.ScrollView>

        {/* ── Bottom nav bar ── */}
        {tabBarVisible && (
          <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 6)}]}>

            {/* Sliding indicator — tracks scroll 1:1 */}
            <View style={styles.tabIndicatorTrack}>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    width: tabWidth,
                    transform: [{translateX: indicatorTranslateX}],
                  },
                ]}
              />
            </View>

            {/* Tab buttons */}
            <View style={styles.tabButtonsContainer}>
              {TABS.map((tab, idx) => {
                const focused = activeIndex === idx;
                return (
                  <Pressable
                    key={tab.key}
                    accessibilityRole="button"
                    accessibilityLabel={tab.title}
                    onPress={() => goToTab(tab.key)}
                    style={({pressed}) => [
                      styles.tabButton,
                      pressed && styles.tabButtonPressed,
                    ]}
                  >
                    <Ionicons
                      name={focused ? tab.icon : tab.iconOutline}
                      size={22}
                      color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        {color: focused ? ACTIVE_COLOR : INACTIVE_COLOR},
                        focused && styles.tabLabelActive,
                      ]}
                    >
                      {tab.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

          </View>
        )}
      </View>
    </TabPagerContext.Provider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FF',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECE7F6',
    elevation: 12,
    shadowColor: '#30214D',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  tabIndicatorTrack: {
    height: 3,
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',   // clip indicator when dragging to first/last edge
  },
  tabIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 3,
    backgroundColor: INDICATOR_COLOR,
    borderRadius: 2,
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
    paddingBottom: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 46,
    gap: 2,
  },
  tabButtonPressed: {
    opacity: 0.65,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
