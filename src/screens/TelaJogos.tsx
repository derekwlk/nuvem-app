import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    BackHandler,
    LayoutChangeEvent,
    PanResponder,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import Svg, {Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop} from 'react-native-svg';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import {useFocusEffect} from 'expo-router';
import {NavigationBar} from 'expo-navigation-bar';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useWallet} from '@/context/WalletContext';
import {useTabPager} from '@/components/TabPagerContext';

type GameMode = 'catalog' | 'playing' | 'paused' | 'landing' | 'won' | 'over';
type SkyObject = {
    id: number;
    kind: 'obstacle' | 'coin' | 'moon';
    emoji: string;
    x: number;
    y: number;
    expiresAt?: number;
};
type GameSnapshot = {
    objects: SkyObject[];
    altitude: number;
    progress: number;
    coinsEarned: number;
};
type GameRuntime = GameSnapshot & {
    elapsedMs: number;
    lastObstacle: number;
    lastCoin: number;
    nextMoonCheckScore: number;
    collisionGraceUntil: number;
    nextId: number;
    ended: boolean;
};

const CLOUD_SIZE = 82;
const GOAL_ALTITUDE = 2600;
const SCORE_MULTIPLIER = 1;
const MOON_CHECK_INTERVAL_SCORE = 250;
// Sky transition thresholds (score values that trigger each phase)
const SKY_SUNSET_SCORE  = 1_000;
const SKY_NIGHT_SCORE   = 2_500;
const SKY_SPACE_SCORE   = 5_000;
// Duration of each sky crossfade in ms (independent of how fast score grows)
const SKY_FADE_MS       = 15_000;
const AIR_OBSTACLES = ['✈️', '🐦', '🎈', '🪁'];
const SPACE_OBSTACLES = ['☄️', '🪨', '🛰️'];
const NIGHT_STARS = [
    [0.09, 0.13, 1.4], [0.26, 0.24, 1.8], [0.46, 0.12, 1.3],
    [0.68, 0.2, 1.5], [0.88, 0.11, 1.8], [0.79, 0.39, 1.3],
    [0.15, 0.46, 1.3], [0.56, 0.42, 1.7],
] as const;

const emptySnapshot: GameSnapshot = {objects: [], altitude: 0, progress: 0, coinsEarned: 0};

function MoonCollectible({
                             object,
                             elapsedMs,
                             onCollect,
                         }: {
    object: SkyObject;
    elapsedMs: SharedValue<number>;
    onCollect: (id: number) => void;
}) {
    const animatedStyle = useAnimatedStyle(() => {
        const expiresAt = object.expiresAt ?? elapsedMs.value;
        const appearsAt = expiresAt - 2000;
        const fadeStart = expiresAt - 500;
        const fadeProgress = Math.min(1, Math.max(0, (elapsedMs.value - fadeStart) / 500));
        const entranceProgress = Math.min(1, Math.max(0, (elapsedMs.value - appearsAt) / 260));
        return {
            opacity: 1 - fadeProgress,
            transform: [
                {translateY: 12 * (1 - entranceProgress)},
                {scale: 0.92 + entranceProgress * 0.08},
            ],
        };
    }, [object.expiresAt]);

    return (
        <Animated.View
            style={[
                styles.moonCollectible,
                {left: object.x - 40, top: object.y - 40},
                animatedStyle,
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Coletar Lua rara"
                hitSlop={10}
                onPress={() => onCollect(object.id)}
                style={({pressed}) => [styles.moonCollectibleButton, pressed && styles.gameMenuButtonPressed]}
            >
                <Text style={styles.moonCollectibleEmoji}>{object.emoji}</Text>
            </Pressable>
        </Animated.View>
    );
}

function getGameScore(altitude: number, coinsEarned: number): number {
    return Math.floor((altitude / 10) * SCORE_MULTIPLIER) + coinsEarned * 25;
}

function findSpawnX(kind: SkyObject['kind'], objects: SkyObject[], width: number, y: number): number | null {
    const margin = Math.min(CLOUD_SIZE * 0.6, width * 0.22);
    const maxX = Math.max(margin, width - margin);

    for (let attempt = 0; attempt < 36; attempt += 1) {
        const x = margin + Math.random() * (maxX - margin);
        const isClear = objects.every((object) => {
            if (Math.abs(object.y - y) >= 150) return true;
            const requiredGap = object.kind === kind ? 70 : 108;
            return Math.abs(object.x - x) >= requiredGap;
        });
        if (isClear) return x;
    }

    return null;
}

const SkyBackground = React.memo(function SkyBackground({width, height}: { width: number; height: number }) {
    return (
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`} style={StyleSheet.absoluteFill}>
            <Defs>
                <LinearGradient id="clearDaySky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#5E9FCF"/>
                    <Stop offset="52%" stopColor="#91C2E1"/>
                    <Stop offset="100%" stopColor="#D7E7EC"/>
                </LinearGradient>
            </Defs>
            <Rect width={width} height={height} fill="url(#clearDaySky)"/>
            <Path
                d={`M${width * 0.1} ${height * 0.27} C ${width * 0.12} ${height * 0.23}, ${width * 0.17} ${height * 0.23}, ${width * 0.19} ${height * 0.27} C ${width * 0.23} ${height * 0.25}, ${width * 0.26} ${height * 0.28}, ${width * 0.25} ${height * 0.31} L${width * 0.1} ${height * 0.31} Z`}
                fill="#F5FBFF"
                opacity={0.22}
            />
            <Path
                d={`M${width * 0.72} ${height * 0.43} C ${width * 0.75} ${height * 0.39}, ${width * 0.8} ${height * 0.4}, ${width * 0.82} ${height * 0.44} C ${width * 0.86} ${height * 0.41}, ${width * 0.9} ${height * 0.45}, ${width * 0.89} ${height * 0.48} L${width * 0.72} ${height * 0.48} Z`}
                fill="#F5FBFF"
                opacity={0.18}
            />
            <Path
                d={`M0 ${height * 0.89} C ${width * 0.1} ${height * 0.82}, ${width * 0.18} ${height * 0.94}, ${width * 0.3} ${height * 0.89} S ${width * 0.49} ${height * 0.85}, ${width * 0.61} ${height * 0.91} S ${width * 0.85} ${height * 0.84}, ${width} ${height * 0.9} L${width} ${height} L0 ${height} Z`}
                fill="#FFFFFF"
                opacity={0.28}
            />
        </Svg>
    );
});

const SunsetSky = React.memo(function SunsetSky({width, height}: { width: number; height: number }) {
    return (
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
            <Defs>
                <LinearGradient id="sunsetSky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#C27783"/>
                    <Stop offset="52%" stopColor="#E99876"/>
                    <Stop offset="100%" stopColor="#F4BE86"/>
                </LinearGradient>
            </Defs>
            <Rect width={width} height={height} fill="url(#sunsetSky)"/>
        </Svg>
    );
});

const NightSky = React.memo(function NightSky({width, height}: { width: number; height: number }) {
    return (
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
            <Defs>
                <LinearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#172844"/>
                    <Stop offset="62%" stopColor="#283752"/>
                    <Stop offset="100%" stopColor="#55475B"/>
                </LinearGradient>
            </Defs>
            <Rect width={width} height={height} fill="url(#nightSky)"/>
        </Svg>
    );
});

const SpaceSky = React.memo(function SpaceSky({width, height}: { width: number; height: number }) {
    return (
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
            <Defs>
                <LinearGradient id="spaceSky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#11152F"/>
                    <Stop offset="55%" stopColor="#1B1C3B"/>
                    <Stop offset="100%" stopColor="#29213D"/>
                </LinearGradient>
            </Defs>
            <Rect width={width} height={height} fill="url(#spaceSky)"/>
        </Svg>
    );
});

const NightSkyDetails = React.memo(function NightSkyDetails({width, height}: { width: number; height: number }) {
    return (
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
            {NIGHT_STARS.map(([x, y, radius], index) => (
                <Circle
                    key={index}
                    cx={width * x}
                    cy={height * y}
                    r={radius}
                    fill="#FFF6D8"
                />
            ))}
            <Path
                d={`M${width * 0.36} ${height * 0.3 - 3} L${width * 0.36 + 1.5} ${height * 0.3 - 1} L${width * 0.36 + 4} ${height * 0.3} L${width * 0.36 + 1.5} ${height * 0.3 + 1} L${width * 0.36} ${height * 0.3 + 4} L${width * 0.36 - 1.5} ${height * 0.3 + 1} L${width * 0.36 - 4} ${height * 0.3} L${width * 0.36 - 1.5} ${height * 0.3 - 1} Z`}
                fill="#FFF6D8"
                opacity={0.85}
            />
        </Svg>
    );
});

const SpaceNebulaDetails = React.memo(function SpaceNebulaDetails({width, height}: { width: number; height: number }) {
    return (
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
            <Ellipse cx={width * 0.22} cy={height * 0.39} rx={width * 0.34} ry={height * 0.12} fill="#A987FF"
                     opacity={0.075}/>
            <Ellipse cx={width * 0.72} cy={height * 0.28} rx={width * 0.3} ry={height * 0.1} fill="#69B8FF"
                     opacity={0.065}/>
            <Ellipse cx={width * 0.59} cy={height * 0.68} rx={width * 0.39} ry={height * 0.13} fill="#D17AD8"
                     opacity={0.055}/>
            <Ellipse cx={width * 0.25} cy={height * 0.82} rx={width * 0.24} ry={height * 0.075} fill="#7295FF"
                     opacity={0.045}/>
        </Svg>
    );
});

function SpinningCoin() {
    const flip = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{perspective: 500}, {scaleX: flip.value}],
    }));

    useEffect(() => {
        flip.value = withRepeat(
            withSequence(
                withTiming(0.35, {duration: 450, easing: Easing.inOut(Easing.ease)}),
                withTiming(1, {duration: 450, easing: Easing.inOut(Easing.ease)}),
                withTiming(0.35, {duration: 450, easing: Easing.inOut(Easing.ease)}),
                withTiming(1, {duration: 450, easing: Easing.inOut(Easing.ease)}),
            ),
            -1,
            false,
        );
    }, [flip]);

    return <Animated.Text style={[styles.coinSprite, animatedStyle]}>🪙</Animated.Text>;
}

function PlayerCloud({
                         sad = false,
                         expression,
                     }: {
    sad?: boolean;
    expression?: 'cat' | 'tongue' | 'laugh';
}) {
    return (
        <Svg width={CLOUD_SIZE} height={68} viewBox="0 0 100 82" style={styles.playerCloud}>
            <Ellipse cx="51" cy="69" rx="28" ry="4.5" fill="#A49BC5" opacity="0.17"/>
            <Path
                d="M23 63 C11 63 5 55 5 46 C5 36 13 28 24 28 C27 14 38 7 51 9 C64 10 71 19 73 29 C87 27 96 36 96 47 C96 57 88 64 76 64 Z"
                fill="#FFFFFF"
                stroke="#E7E2F5"
                strokeWidth="2.5"
            />
            <Circle cx="34" cy="48" r="5.8" fill="#FFB7C5" opacity="0.82"/>
            <Circle cx="69" cy="48" r="5.8" fill="#FFB7C5" opacity="0.82"/>
            {sad ? (
                <>
                    <Path d="M34 39 Q39 34 44 39" stroke="#4F456B" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
                    <Path d="M59 39 Q64 34 69 39" stroke="#4F456B" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
                    <Path d="M44 55 Q51 47 59 55" stroke="#4F456B" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
                </>
            ) : expression === 'laugh' ? (
                <>
                    <Path d="M33 35 L42 41 L33 47" stroke="#4F456B" strokeWidth="3.6" strokeLinecap="round"
                          strokeLinejoin="round" fill="none"/>
                    <Path d="M69 35 L60 41 L69 47" stroke="#4F456B" strokeWidth="3.6" strokeLinecap="round"
                          strokeLinejoin="round" fill="none"/>
                    <Path d="M42 50 Q51 57 60 50 Q59 61 51 62 Q43 61 42 50 Z" fill="#4F456B"/>
                    <Path d="M44 53 Q49 55 54 53 L52 59 Q48 60 46 57 Z" fill="#F28C9E"/>
                    <Path d="M44 53 Q49 55 54 53" stroke="#E87587" strokeWidth="1.2" fill="none"/>
                </>
            ) : expression === 'tongue' ? (
                <>
                    <Circle cx="39" cy="39" r="3" fill="#4F456B"/>
                    <Circle cx="64" cy="39" r="3" fill="#4F456B"/>
                    <Path d="M37 50 L64 50" stroke="#4F456B" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    <Path d="M39 50 L59 50 Q59 60 51 63 Q41 61 39 55 Z" fill="#F02835"
                          stroke="#4F456B" strokeWidth="2.2" strokeLinejoin="round"/>
                </>
            ) : expression === 'cat' ? (
                <>
                    <Circle cx="39" cy="39" r="3" fill="#4F456B"/>
                    <Circle cx="64" cy="39" r="3" fill="#4F456B"/>
                    <Path d="M42 49 Q47 55 52 49 Q57 55 62 49" stroke="#4F456B" strokeWidth="2.8" strokeLinecap="round"
                          fill="none"/>
                </>
            ) : (
                <>
                    <Path d="M34 39 Q39 32 44 39" stroke="#4F456B" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
                    <Path d="M59 39 Q64 32 69 39" stroke="#4F456B" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
                    <Path d="M43 49 Q51 57 60 49" stroke="#4F456B" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
                </>
            )}
        </Svg>
    );
}

function DarkCloudCompanion() {
    return (
        <Svg width={40} height={26} viewBox="0 0 100 65" pointerEvents="none">
            <Ellipse cx="51" cy="57" rx="32" ry="5" fill="#22243A" opacity={0.18}/>
            <Path
                d="M22 51 C11 51 5 44 5 35 C5 26 12 20 22 20 C25 10 34 5 45 6 C57 6 65 14 67 22 C81 19 94 27 94 38 C94 46 86 52 75 52 Z"
                fill="#73758D"
                stroke="#5B5D75"
                strokeWidth="4"
            />
            <Circle cx="39" cy="34" r="3" fill="#37394F"/>
            <Circle cx="62" cy="34" r="3" fill="#37394F"/>
        </Svg>
    );
}

function RainbowTrail() {
    return (
      <Svg
        pointerEvents="none"
        width={72}
        height={58}
        viewBox="0 0 72 58"
      >
        <Path d="M22 0 H30 C27 10 23 19 25 29 C27 39 22 49 18 58 H8 C12 48 17 39 15 29 C13 19 18 10 22 0 Z" fill="#F05D6E" />
        <Path d="M30 0 H38 C35 10 31 19 33 29 C35 39 31 49 27 58 H18 C22 48 27 39 25 29 C23 19 27 10 30 0 Z" fill="#F49A55" />
        <Path d="M38 0 H46 C43 10 39 19 41 29 C43 39 40 49 36 58 H27 C31 48 35 39 33 29 C31 19 35 10 38 0 Z" fill="#F3D95B" />
        <Path d="M46 0 H54 C51 10 47 19 49 29 C51 39 49 49 45 58 H36 C40 48 43 39 41 29 C39 19 43 10 46 0 Z" fill="#69BF83" />
        <Path d="M54 0 H62 C59 10 55 19 57 29 C59 39 58 49 54 58 H45 C49 48 51 39 49 29 C47 19 51 10 54 0 Z" fill="#45ABD2" />
        <Path d="M62 0 H70 C67 10 63 19 65 29 C67 39 67 49 63 58 H54 C58 48 59 39 57 29 C55 19 59 10 62 0 Z" fill="#9971D1" />
      </Svg>
    );
}

// Esconde/mostra a barra de status e a de navegação (tela cheia do jogo).
function setSystemBarsHidden(hidden: boolean) {
    StatusBar.setHidden(hidden, 'fade');
    if (Platform.OS === 'android') NavigationBar.setHidden(hidden);
}

export default function TelaJogos() {
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const {setSwipeEnabled, setTabBarVisible} = useTabPager();
    const {addCoins, addMoons, moonBalance, ready: walletReady, equippedItemId, bestScore, updateBestScore} = useWallet();
    const [mode, setMode] = useState<GameMode>('catalog');
    const [stageSize, setStageSize] = useState({width: windowWidth, height: windowHeight});
    const [snapshot, setSnapshot] = useState<GameSnapshot>(emptySnapshot);
    const [isFocused, setIsFocused] = useState(true);
    const [showMoonToast, setShowMoonToast] = useState(false);
    const modeRef = useRef(mode);
    const modeBeforePause = useRef<GameMode>('playing');
    const moonToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cloudX = useSharedValue(windowWidth / 2);
    const cloudTargetX = useSharedValue(windowWidth / 2);
    const cloudOffset = useSharedValue(0);
    const cloudScale = useSharedValue(1);
    const cloudBob = useSharedValue(0);
    const cloudTilt = useSharedValue(0);
    const gameElapsed = useSharedValue(0);
    const gameScore      = useSharedValue(0);
    const sunsetProgress  = useSharedValue(0);
    const nightProgress   = useSharedValue(0);
    const spaceProgress   = useSharedValue(0);
    const moonApproach    = useSharedValue(0);
    const heldDirection      = useRef(0);
    // Tracks which sky phases have already been triggered so we don't re-fire
    const skyPhaseTriggered = useRef({sunset: false, night: false, space: false});
    const cloudVelocityX = useRef(0);
    const dragStartX = useRef(windowWidth / 2);
    const runtime = useRef<GameRuntime>({
        ...emptySnapshot,
        elapsedMs: 0,
        lastObstacle: 0,
        lastCoin: 0,
        nextMoonCheckScore: MOON_CHECK_INTERVAL_SCORE,
        collisionGraceUntil: 0,
        nextId: 1,
        ended: false,
    });

    useFocusEffect(useCallback(() => {
        setIsFocused(true);
        const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (modeRef.current === 'over') {
                runtime.current.ended = true;
                runtime.current.objects = [];
                setSnapshot(emptySnapshot);
                setSystemBarsHidden(false);
                setSwipeEnabled(true);
                setTabBarVisible(true);
                setMode('catalog');
            } else if (modeRef.current !== 'catalog' && modeRef.current !== 'paused') {
                modeBeforePause.current = modeRef.current;
                setMode('paused');
            } else if (modeRef.current === 'paused') {
                setMode(modeBeforePause.current);
            } else {
                return false;
            }
            return true;
        });
        return () => {
            setIsFocused(false);
            heldDirection.current = 0;
            StatusBar.setHidden(false, 'fade');
            if (Platform.OS === 'android') NavigationBar.setHidden(false);
            backSubscription.remove();
        };
    }, []));

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    useEffect(() => () => {
        if (moonToastTimer.current) clearTimeout(moonToastTimer.current);
    }, []);

    useEffect(() => {
        setSystemBarsHidden(mode !== 'catalog');
        setSwipeEnabled(mode === 'catalog');
        setTabBarVisible(mode === 'catalog');
    }, [mode, setSwipeEnabled, setTabBarVisible]);

    // Restaura as barras só ao sair da tela. Se isso ficasse no cleanup do efeito acima,
    // rodaria a cada troca de modo (ex.: playing -> over) e as barras piscariam.
    useEffect(() => () => {
        setSystemBarsHidden(false);
        setSwipeEnabled(true);
        setTabBarVisible(true);
    }, [setSwipeEnabled, setTabBarVisible]);

    useEffect(() => {
        cloudBob.value = withRepeat(
            withTiming(-7, {duration: 1900, easing: Easing.inOut(Easing.ease)}),
            -1,
            true,
        );
        cloudTilt.value = withRepeat(
            withSequence(
                withTiming(-1.5, {duration: 1900, easing: Easing.inOut(Easing.ease)}),
                withTiming(1.5, {duration: 1900, easing: Easing.inOut(Easing.ease)}),
                withTiming(0, {duration: 900, easing: Easing.inOut(Easing.ease)}),
            ),
            -1,
            false,
        );
    }, [cloudBob, cloudTilt]);

    useEffect(() => {
        if (mode !== 'landing') return;
        const finalScore = getGameScore(runtime.current.altitude, runtime.current.coinsEarned);
        updateBestScore(finalScore);
        cloudOffset.value = withTiming(-stageSize.height * 0.24, {
            duration: 2300,
            easing: Easing.inOut(Easing.cubic),
        });
        cloudX.value = withTiming(stageSize.width * 0.34, {
            duration: 1900,
            easing: Easing.inOut(Easing.cubic),
        });
        cloudScale.value = withTiming(1.15, {
            duration: 1900,
            easing: Easing.inOut(Easing.cubic),
        });
        const timer = setTimeout(() => setMode('won'), 2500);
        return () => clearTimeout(timer);
    }, [mode, stageSize.height, stageSize.width, cloudOffset, cloudX, cloudScale, updateBestScore]);

    const clampCloudX = useCallback((x: number) => {
        const margin = CLOUD_SIZE * 0.53;
        return Math.max(margin, Math.min(stageSize.width - margin, x));
    }, [stageSize.width]);

    const panResponder = useMemo(() => PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
            mode === 'playing' && Math.abs(gesture.dx) > 5 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
            dragStartX.current = cloudX.value;
            cloudTargetX.value = cloudX.value;
            cloudVelocityX.current = 0;
        },
        onPanResponderMove: (_event, gesture) => {
            const nextX = clampCloudX(dragStartX.current + gesture.dx);
            cloudTargetX.value = nextX;
            cloudX.value = nextX;
            cloudVelocityX.current = 0;
        },
        onPanResponderRelease: () => {
            cloudVelocityX.current = 0;
        },
        onPanResponderTerminate: () => {
            cloudVelocityX.current = 0;
        },
    }), [mode, cloudX, cloudTargetX, clampCloudX]);

    const cloudAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {translateX: cloudX.value - CLOUD_SIZE / 2},
            {translateY: cloudOffset.value + cloudBob.value},
            {rotate: `${cloudTilt.value}deg`},
            {scale: cloudScale.value},
        ],
    }));

    const onStageLayout = (event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
            setStageSize((current) =>
                Math.abs(current.width - width) > 1 || Math.abs(current.height - height) > 1
                    ? {width, height}
                    : current,
            );
            if (mode === 'catalog') {
                cloudX.value = width / 2;
                cloudTargetX.value = width / 2;
            }
        }
    };

    const startGame = useCallback(() => {
        if (!walletReady) return;
        // Começa a esconder as barras do sistema já no toque, sem esperar a tela do jogo renderizar.
        setSystemBarsHidden(true);
        heldDirection.current = 0;
        cloudVelocityX.current = 0;
        runtime.current = {
            objects: [],
            altitude: 0,
            progress: 0,
            coinsEarned: 0,
            elapsedMs: 0,
            lastObstacle: 0,
            lastCoin: 0,
            nextMoonCheckScore: MOON_CHECK_INTERVAL_SCORE,
            collisionGraceUntil: 0,
            nextId: 1,
            ended: false,
        };
        setSnapshot(emptySnapshot);
        cloudX.value = stageSize.width / 2;
        cloudTargetX.value = stageSize.width / 2;
        cloudOffset.value = 0;
        cloudScale.value = 1;
        gameElapsed.value    = 0;
        gameScore.value      = 0;
        // Reset sky phase progress — each withTiming will be re-triggered by score threshold
        sunsetProgress.value = 0;
        nightProgress.value  = 0;
        spaceProgress.value  = 0;
        skyPhaseTriggered.current = {sunset: false, night: false, space: false};
        moonApproach.value   = 0;
        setShowMoonToast(false);
        if (moonToastTimer.current) clearTimeout(moonToastTimer.current);
        // Barra de abas some na mesma atualização em que o jogo aparece (um render só).
        setSwipeEnabled(false);
        setTabBarVisible(false);
        setMode('playing');
    }, [setSwipeEnabled, setTabBarVisible, walletReady, stageSize.width, cloudX, cloudTargetX, cloudOffset, cloudScale, gameElapsed, gameScore, sunsetProgress, nightProgress, spaceProgress, moonApproach]);

    const collectMoon = useCallback((objectId: number) => {
        const game = runtime.current;
        const moon = game.objects.find((object) => object.id === objectId && object.kind === 'moon');
        if (modeRef.current !== 'playing' || game.ended || !moon) return;
        if (moon.expiresAt !== undefined && game.elapsedMs >= moon.expiresAt) return;

        game.objects = game.objects.filter((object) => object.id !== objectId);
        addMoons(1);
        setSnapshot({
            objects: game.objects.map((object) => ({...object})),
            altitude: game.altitude,
            progress: game.progress,
            coinsEarned: game.coinsEarned,
        });
        setShowMoonToast(true);
        if (moonToastTimer.current) clearTimeout(moonToastTimer.current);
        moonToastTimer.current = setTimeout(() => setShowMoonToast(false), 2600);
    }, [addMoons]);

    useEffect(() => {
        if (mode !== 'playing' || !isFocused) return;
        let animationFrame = 0;
        let lastTime = 0;
        let lastRender = 0;

        const tick = (now: number) => {
            if (!lastTime) lastTime = now;
            const delta = Math.min((now - lastTime) / 1000, 0.04);
            lastTime = now;
            const game = runtime.current;
            if (game.ended) return;

            game.elapsedMs += delta * 1000;
            game.progress = Math.min(1, game.altitude / GOAL_ALTITUDE);
            game.altitude += delta * (20 + game.progress * 13);
            const difficulty = Math.min(1, game.altitude / GOAL_ALTITUDE);
            const scrollSpeed = 112 + difficulty * 58;
            const movementSpeed = 240 + difficulty * 35;
            cloudTargetX.value = clampCloudX(cloudTargetX.value + heldDirection.current * movementSpeed * delta);
            const cloudAcceleration = (cloudTargetX.value - cloudX.value) * 68 - cloudVelocityX.current * 10.5;
            cloudVelocityX.current += cloudAcceleration * delta;
            const nextCloudX = clampCloudX(cloudX.value + cloudVelocityX.current * delta);
            if (nextCloudX === cloudX.value) cloudVelocityX.current = 0;
            cloudX.value = nextCloudX;

            const obstacleDelay = 1760 - difficulty * 360;
            if (game.elapsedMs - game.lastObstacle >= obstacleDelay) {
                const y = -38;
                const x = findSpawnX('obstacle', game.objects, stageSize.width, y);
                if (x !== null) {
                    const obstacleSet = difficulty < 0.5 ? AIR_OBSTACLES : SPACE_OBSTACLES;
                    game.objects.push({
                        id: game.nextId++,
                        kind: 'obstacle',
                        emoji: obstacleSet[Math.floor(Math.random() * obstacleSet.length)],
                        x,
                        y,
                    });
                }
                game.lastObstacle = game.elapsedMs;
            }
            if (game.elapsedMs - game.lastCoin >= 2300) {
                const y = -30;
                const x = findSpawnX('coin', game.objects, stageSize.width, y);
                if (x !== null) {
                    game.objects.push({
                        id: game.nextId++,
                        kind: 'coin',
                        emoji: '🪙',
                        x,
                        y,
                    });
                }
                game.lastCoin = game.elapsedMs;
            }

            const cloudY = stageSize.height * 0.67 + 30;
            const cloudPositionX = cloudX.value;
            const kept: SkyObject[] = [];
            const collectedCoins: SkyObject[] = [];
            let coinPickupCount = 0;
            let hitObstacle = false;
            for (const object of game.objects) {
                if (object.kind !== 'moon') object.y += scrollSpeed * delta;
                const verticalDistance = Math.abs(object.y - cloudY);
                const horizontalDistance = Math.abs(object.x - cloudPositionX);
                if (object.expiresAt !== undefined && game.elapsedMs >= object.expiresAt) continue;
                if (object.kind === 'moon') {
                    kept.push(object);
                    continue;
                }
                const verticalRadius = object.kind === 'coin' ? 39 : 32;
                const horizontalRadius = object.kind === 'coin' ? 39 : 37;
                if (verticalDistance < verticalRadius && horizontalDistance < horizontalRadius) {
                    if (object.kind === 'coin') {
                        coinPickupCount += 1;
                        collectedCoins.push(object);
                        continue;
                    }
                    if (game.elapsedMs >= game.collisionGraceUntil) hitObstacle = true;
                    kept.push(object);
                    continue;
                }
                if (object.y < stageSize.height + 55) kept.push(object);
            }
            if (hitObstacle) {
                kept.push(...collectedCoins);
                coinPickupCount = 0;
            }
            game.objects = kept;
            if (coinPickupCount > 0) {
                game.coinsEarned += coinPickupCount;
                addCoins(coinPickupCount);
            }
            game.progress = Math.min(1, game.altitude / GOAL_ALTITUDE);
            const score = getGameScore(game.altitude, game.coinsEarned);
            gameScore.value = score;

            // Trigger sky phase transitions based on score thresholds.
            // Each transition runs on its own withTiming clock — independent of score jumps.
            if (score >= SKY_SUNSET_SCORE && !skyPhaseTriggered.current.sunset) {
                skyPhaseTriggered.current.sunset = true;
                sunsetProgress.value = withTiming(1, {duration: SKY_FADE_MS, easing: Easing.inOut(Easing.ease)});
            }
            if (score >= SKY_NIGHT_SCORE && !skyPhaseTriggered.current.night) {
                skyPhaseTriggered.current.night = true;
                nightProgress.value = withTiming(1, {duration: SKY_FADE_MS, easing: Easing.inOut(Easing.ease)});
            }
            if (score >= SKY_SPACE_SCORE && !skyPhaseTriggered.current.space) {
                skyPhaseTriggered.current.space = true;
                spaceProgress.value = withTiming(1, {duration: SKY_FADE_MS, easing: Easing.inOut(Easing.ease)});
            }

            while (score >= game.nextMoonCheckScore) {
                game.nextMoonCheckScore += MOON_CHECK_INTERVAL_SCORE;
                if (!game.objects.some((object) => object.kind === 'moon') && Math.random() < 0.1) {
                    game.objects.push({
                        id: game.nextId++,
                        kind: 'moon',
                        emoji: '🌝',
                        x: stageSize.width / 2,
                        y: 126,
                        expiresAt: game.elapsedMs + 2000,
                    });
                }
            }

            if (now - lastRender >= 33) {
                gameElapsed.value = game.elapsedMs;
                setSnapshot({
                    objects: game.objects.map((object) => ({...object})),
                    altitude: game.altitude,
                    progress: game.progress,
                    coinsEarned: game.coinsEarned,
                });
                lastRender = now;
            }

            if (hitObstacle) {
                const finalScore = getGameScore(game.altitude, game.coinsEarned);
                updateBestScore(finalScore);
                setSnapshot({
                    objects: game.objects.map((object) => ({...object})),
                    altitude: game.altitude,
                    progress: game.progress,
                    coinsEarned: game.coinsEarned,
                });
                game.ended = true;
                heldDirection.current = 0;
                cloudScale.value = withTiming(0.94, {duration: 240, easing: Easing.out(Easing.quad)});
                setMode('over');
                return;
            }
            animationFrame = requestAnimationFrame(tick);
        };

        animationFrame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrame);
    }, [mode, isFocused, addCoins, updateBestScore, stageSize.height, stageSize.width, clampCloudX, cloudX, cloudTargetX, cloudScale, gameElapsed, gameScore, sunsetProgress, nightProgress, spaceProgress]);

    // Sky layer opacities are driven by time-based progress values (0→1 via withTiming),
    // NOT by the raw score. This prevents collecting coins from jumping the sky mid-fade.
    const sunsetStyle = useAnimatedStyle(() => ({
        opacity: sunsetProgress.value * (1 - nightProgress.value * 0.8) * 0.42,
    }));
    const nightStyle = useAnimatedStyle(() => ({
        opacity: nightProgress.value * 0.86,
    }));
    const starsStyle = useAnimatedStyle(() => ({
        opacity: nightProgress.value * 0.82,
    }));
    const spaceStyle = useAnimatedStyle(() => ({
        opacity: spaceProgress.value,
    }));
    const nebulaStyle = useAnimatedStyle(() => ({
        opacity: spaceProgress.value,
    }));

    const moonStyle = useAnimatedStyle(() => ({
        left: stageSize.width * (0.32 + moonApproach.value * 0.1),
        top: stageSize.height * (0.025 + moonApproach.value * 0.37),
        fontSize: 28 + moonApproach.value * 58,
        opacity: 0.55 + moonApproach.value * 0.45,
    }));

    return (
        <View style={mode === 'catalog' ? [styles.catalogScreen, {paddingTop: Math.max(insets.top + 8, 28)}] : styles.screen}>
                {mode === 'catalog' ? (
                    <View style={styles.catalogContent}>
                        <Text style={styles.catalogEyebrow}>UM CANTINHO NO CÉU</Text>
                        <Text style={styles.catalogTitle}>Jogos</Text>
                        <Text style={styles.catalogDescription}>Escolha uma aventura para brincar com a Nuvinha.</Text>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Selecionar Nuvinha Sky"
                            disabled={!walletReady}
                            onPress={startGame}
                            style={({pressed}) => [styles.gameCard, pressed && styles.gameCardPressed, !walletReady && styles.gameCardDisabled]}
                        >
                            <View style={styles.gameCardIcon}>
                                <Text style={styles.gameCardEmoji}>☁️</Text>
                            </View>
                            <View style={styles.gameCardCopy}>
                                <Text style={styles.gameCardTitle}>Nuvinha Sky</Text>
                                <Text style={styles.gameCardDescription}>Desvie dos perigos, colete moedinhas e procure
                                    um segredo no céu.</Text>
                            </View>
                            <Text style={styles.gameCardArrow}>{walletReady ? '›' : '…'}</Text>

                            <View style={styles.highScorePopup}>
                                <Text style={styles.highScorePopupEmoji}>🏆</Text>
                                <Text style={styles.highScorePopupLabel}>Recorde:</Text>
                                <Text style={styles.highScorePopupValue}>
                                    {bestScore > 0 ? `${bestScore.toLocaleString('pt-BR')} pts` : '0 pts'}
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        <View
                            style={styles.scene}
                            onLayout={onStageLayout}
                            onTouchEnd={() => {
                                if (mode === 'won') startGame();
                            }}
                            {...(mode === 'playing' ? panResponder.panHandlers : {})}
                        >
                            <SkyBackground width={stageSize.width} height={stageSize.height}/>
                            <Animated.View pointerEvents="none" style={[styles.skyOverlay, sunsetStyle]}>
                                <SunsetSky width={stageSize.width} height={stageSize.height}/>
                            </Animated.View>
                            <Animated.View pointerEvents="none" style={[styles.skyOverlay, nightStyle]}>
                                <NightSky width={stageSize.width} height={stageSize.height}/>
                            </Animated.View>
                            <Animated.View pointerEvents="none" style={[styles.skyOverlay, spaceStyle]}>
                                <SpaceSky width={stageSize.width} height={stageSize.height}/>
                            </Animated.View>
                            <Animated.View pointerEvents="none" style={[styles.skyOverlay, nebulaStyle]}>
                                <SpaceNebulaDetails width={stageSize.width} height={stageSize.height}/>
                            </Animated.View>
                            <Animated.View pointerEvents="none"
                                           style={[styles.skyOverlay, styles.nightStars, starsStyle]}>
                                <NightSkyDetails width={stageSize.width} height={stageSize.height}/>
                            </Animated.View>

                            {(mode === 'playing' || mode === 'paused' || mode === 'landing' || mode === 'won' || mode === 'over') && (
                                <>
                                    <View style={[styles.scoreBar, {top: Math.max(insets.top, 14)}]} pointerEvents="none">
                                        <View>
                                            <Text style={styles.scoreLabel}>PONTUAÇÃO</Text>
                                            <Text style={styles.scoreValue}>
                                                {getGameScore(snapshot.altitude, snapshot.coinsEarned).toLocaleString('pt-BR')}
                                            </Text>
                                        </View>
                                        <View style={styles.coinScore}>
                                            <Text
                                                style={styles.coinScoreText}>🪙 {snapshot.coinsEarned} 🌙 {moonBalance}</Text>
                                        </View>
                                    </View>
                                    {showMoonToast && (
                                        <Animated.View
                                            entering={FadeIn.duration(180)}
                                            exiting={FadeOut.duration(240)}
                                            pointerEvents="none"
                                            style={[styles.moonToast, {top: Math.max(insets.top, 14) + 62}]}
                                        >
                                            <Text style={styles.moonToastTitle}>Lua descoberta!</Text>
                                            <Text style={styles.moonToastText}>Você ganhou uma Lua rara</Text>
                                        </Animated.View>
                                    )}
                                    {snapshot.objects.map((object) => object.kind === 'moon' ? (
                                        <MoonCollectible key={object.id} object={object} elapsedMs={gameElapsed}
                                                         onCollect={collectMoon}/>
                                    ) : (
                                        <View
                                            key={object.id}
                                            pointerEvents="none"
                                            style={[
                                                styles.skyObject,
                                                {
                                                    left: object.x - 25,
                                                    top: object.y - 25,
                                                },
                                            ]}
                                        >
                                            {object.kind === 'coin'
                                                ? <SpinningCoin/>
                                                : <Text style={{fontSize: 35}}>{object.emoji}</Text>}
                                        </View>
                                    ))}
                                </>
                            )}

                            {mode !== 'paused' && mode !== 'over' && mode !== 'won' && (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Abrir menu do jogo"
                                    onPress={() => {
                                        modeBeforePause.current = mode;
                                        setMode('paused');
                                    }}
                                    style={({pressed}) => [styles.gameMenuButton, {top: Math.max(insets.top, 14) + 68}, pressed && styles.gameMenuButtonPressed]}
                                >
                                    <Text style={styles.gameMenuIcon}>☰</Text>
                                </Pressable>
                            )}

                            {(mode === 'landing' || mode === 'won') && (
                                <Animated.Text style={[styles.moon, moonStyle]}>🌝</Animated.Text>
                            )}

                            {mode === 'won' && (
                                <Animated.View entering={FadeIn.duration(700)} style={styles.winCaption}
                                               pointerEvents="none">
                                    <Text style={styles.winTitle}>Lua secreta descoberta!</Text>
                                    <Text style={styles.winSubtitle}>Você encontrou um easter egg. Toque para jogar de
                                        novo.</Text>
                                </Animated.View>
                            )}



                            <Animated.View
                                style={[
                                    styles.player,
                                    {top: stageSize.height * 0.67},
                                    cloudAnimatedStyle,
                                ]}
                                pointerEvents="none"
                            >
                                {equippedItemId === 'rainbow-undercloud' && (
                                    <View style={styles.rainbowTrail} pointerEvents="none">
                                        <RainbowTrail/>
                                    </View>
                                )}
                                <View style={styles.playerCloudWrapper} pointerEvents="none">
                                    <PlayerCloud
                                        sad={mode === 'over'}
                                        expression={
                                            equippedItemId === 'face-cat' ? 'cat'
                                                : equippedItemId === 'face-tongue' ? 'tongue'
                                                    : equippedItemId === 'face-laugh' ? 'laugh'
                                                        : undefined
                                        }
                                    />
                                </View>
                                {equippedItemId === 'dark-cloud-companion' && (
                                    <View style={styles.darkCloudCompanion} pointerEvents="none">
                                        <DarkCloudCompanion/>
                                    </View>
                                )}
                                {equippedItemId === 'cloud-cap' && <Text style={styles.cloudCapFx}>🧢</Text>}
                                {mode === 'won' && <Text style={styles.heartFloat}>💗</Text>}
                            </Animated.View>

                        </View>
                        {mode === 'paused' && (
                            <View style={styles.pauseOverlay}>
                                <View style={styles.pauseCard}>
                                    <Text style={styles.pauseTitle}>Jogo pausado</Text>
                                    <Pressable onPress={() => setMode(modeBeforePause.current)}
                                               style={styles.menuButton}>
                                        <Text style={styles.menuButtonText}>Continuar</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => {
                                            const finalScore = getGameScore(runtime.current.altitude, runtime.current.coinsEarned);
                                            updateBestScore(finalScore);
                                            runtime.current.ended = true;
                                            runtime.current.objects = [];
                                            setSnapshot(emptySnapshot);
                                            setSystemBarsHidden(false);
                                            setSwipeEnabled(true);
                                            setTabBarVisible(true);
                                            setMode('catalog');
                                        }}
                                        style={styles.menuButtonSecondary}
                                    >
                                        <Text style={styles.menuButtonSecondaryText}>Lista de jogos</Text>
                                    </Pressable>
                                    <Text style={styles.menuHint}>Use Voltar para fechar este menu</Text>
                                </View>
                            </View>
                        )}
                        {mode === 'over' && (
                            <View style={styles.pauseOverlay}>
                                <View style={styles.pauseCard}>
                                    <Text style={styles.resultEmoji}>☁️💫</Text>
                                    <Text style={styles.pauseTitle}>Ops! um encontrão!</Text>
                                    <Text style={styles.resultScore}>
                                        Pontuação: {getGameScore(snapshot.altitude, snapshot.coinsEarned).toLocaleString('pt-BR')} pts
                                    </Text>
                                    {getGameScore(snapshot.altitude, snapshot.coinsEarned) >= bestScore && bestScore > 0 && (
                                        <View style={styles.newRecordBadge}>
                                            <Text style={styles.newRecordBadgeText}>🏆 Novo Recorde!</Text>
                                        </View>
                                    )}
                                    <View style={styles.gameOverButtons}>
                                        <Pressable
                                            onPress={startGame}
                                            style={({pressed}) => [styles.menuButton, pressed && styles.gameMenuButtonPressed]}
                                        >
                                            <Text style={styles.menuButtonText}>Tentar novamente</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => {
                                                runtime.current.ended = true;
                                                runtime.current.objects = [];
                                                setSnapshot(emptySnapshot);
                                                setSystemBarsHidden(false);
                                                setSwipeEnabled(true);
                                                setTabBarVisible(true);
                                                setMode('catalog');
                                            }}
                                            style={({pressed}) => [styles.menuButtonSecondary, pressed && styles.gameMenuButtonPressed]}
                                        >
                                            <Text style={styles.menuButtonSecondaryText}>Lista de jogos</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        )}
                    </>
                )}
            </View>
    );
}

const styles = StyleSheet.create({
    catalogScreen: {flex: 1, backgroundColor: '#F7F5FF', paddingHorizontal: 22, paddingTop: 28},
    catalogContent: {flex: 1},
    catalogEyebrow: {fontSize: 10, letterSpacing: 1.8, fontWeight: '800', color: '#9A91B8', marginBottom: 5},
    catalogTitle: {fontSize: 30, fontWeight: '800', letterSpacing: -0.6, color: '#4D426B'},
    catalogDescription: {color: '#827A9E', fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 22},
    gameCard: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        paddingBottom: 22,
        borderWidth: 1,
        borderColor: '#EEE8FB',
        gap: 13,
        marginBottom: 16,
    },
    highScorePopup: {
        position: 'absolute',
        bottom: -11,
        left: 18,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 4.5,
        borderWidth: 1.5,
        borderColor: '#DDD4F8',
        shadowColor: '#4A3D6B',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.14,
        shadowRadius: 5,
        elevation: 6,
        gap: 5,
        zIndex: 10,
    },
    highScorePopupEmoji: {
        fontSize: 12,
    },
    highScorePopupLabel: {
        color: '#7D70A3',
        fontSize: 11,
        fontWeight: '700',
    },
    highScorePopupValue: {
        color: '#534377',
        fontSize: 11,
        fontWeight: '900',
    },
    gameCardPressed: {backgroundColor: '#F2EEFC', transform: [{scale: 0.99}]},
    gameCardDisabled: {opacity: 0.55},
    gameCardIcon: {
        width: 58,
        height: 58,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F4FF'
    },
    gameCardEmoji: {fontSize: 31},
    gameCardCopy: {flex: 1, gap: 4},
    gameCardTitle: {color: '#594B7B', fontSize: 16, fontWeight: '800'},
    gameCardDescription: {color: '#827A9E', fontSize: 12, lineHeight: 17},
    gameCardArrow: {color: '#9D8DDB', fontSize: 32, fontWeight: '400'},
    screen: {flex: 1, backgroundColor: '#5E9FCF'},
    scene: {flex: 1, overflow: 'hidden', backgroundColor: '#5E9FCF'},
    skyOverlay: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0},
    nightStars: {zIndex: 1},
    scoreBar: {
        position: 'absolute',
        zIndex: 8,
        top: 14,
        left: 15,
        right: 15,
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.72)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 17
    },
    scoreLabel: {color: '#665A8C', fontSize: 9, fontWeight: '800', letterSpacing: 1.1},
    scoreValue: {color: '#51446F', fontSize: 19, fontWeight: '900', marginTop: 1},
    coinScore: {paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.68)'},
    coinScoreText: {color: '#665A8C', fontSize: 13, fontWeight: '800'},
    moonToast: {
        position: 'absolute',
        top: 76,
        alignSelf: 'center',
        minWidth: 170,
        maxWidth: 220,
        zIndex: 9,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        elevation: 9,
        shadowColor: '#4A3D6B',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.12,
        shadowRadius: 6
    },
    moonToastTitle: {color: '#594B7B', fontSize: 13, fontWeight: '900'},
    moonToastText: {color: '#82769D', fontSize: 11, marginTop: 2},
    skyObject: {position: 'absolute', width: 50, height: 50, alignItems: 'center', justifyContent: 'center', zIndex: 3, elevation: 3},
    moonCollectible: {position: 'absolute', width: 80, height: 80, zIndex: 4, elevation: 4},
    moonCollectibleButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)'
    },
    moonCollectibleEmoji: {fontSize: 54, textShadowColor: 'rgba(255,255,255,0.9)', textShadowRadius: 12},
    coinSprite: {fontSize: 28},
    resultCard: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.86)',
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingVertical: 17,
        borderColor: 'rgba(255,255,255,0.95)',
        borderWidth: 1,
        zIndex: 9,
        elevation: 9
    },
    resultEmoji: {fontSize: 28, marginBottom: 5},
    resultTitle: {color: '#594B7B', fontSize: 19, fontWeight: '800', textAlign: 'center'},
    resultScore: {color: '#594B7B', fontSize: 15, fontWeight: '800', marginTop: 6},
    newRecordBadge: {
        backgroundColor: '#FFF2C6',
        borderColor: '#FBD867',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginTop: 6,
    },
    newRecordBadgeText: {
        color: '#7C5600',
        fontSize: 12,
        fontWeight: '800',
    },
    resultText: {color: '#8C81A8', fontSize: 12, textAlign: 'center', lineHeight: 17, marginTop: 7},
    player: {
        position: 'absolute',
        left: 0,
        width: CLOUD_SIZE,
        height: 78,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 8,
        elevation: 8
    },
    playerCloudWrapper: {
        position: 'relative',
        zIndex: 2,
        elevation: 2
    },
    playerCloud: {position: 'relative'},
    moon: {position: 'absolute', textAlign: 'center', width: 120, zIndex: 2},
    winCaption: {
        position: 'absolute',
        top: '53%',
        left: 15,
        right: 15,
        alignItems: 'center',
        zIndex: 9,
        elevation: 9,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 8
    },
    winTitle: {color: '#594A7B', fontSize: 20, fontWeight: '900', textAlign: 'center'},
    winSubtitle: {color: '#82769D', fontSize: 11, marginTop: 4, textAlign: 'center'},
    gameMenuButton: {
        position: 'absolute',
        top: 82,
        right: 16,
        zIndex: 10,
        elevation: 10,
        width: 44,
        height: 44,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.82)'
    },
    gameMenuButtonPressed: {opacity: 0.78, transform: [{scale: 0.96}]},
    gameMenuIcon: {color: '#594B7B', fontSize: 22, fontWeight: '700'},
    pauseOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
        backgroundColor: 'rgba(17,19,51,0.38)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    pauseCard: {
        width: '100%',
        maxWidth: 320,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderRadius: 24,
        padding: 22,
        gap: 12
    },
    pauseTitle: {color: '#594B7B', fontSize: 22, fontWeight: '800', marginBottom: 4},
    menuButton: {
        width: '100%',
        minHeight: 50,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#A99BEA'
    },
    menuButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
    menuButtonSecondary: {
        width: '100%',
        minHeight: 48,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1EEFA'
    },
    menuButtonSecondaryText: {color: '#6A5A91', fontSize: 14, fontWeight: '800'},
    menuHint: {color: '#9389AA', fontSize: 11, marginTop: 2},
    gameOverButtons: {width: '100%', gap: 10, marginTop: 4},
    heartFloat: {position: 'absolute', top: -9, right: 1, fontSize: 20, zIndex: 3, elevation: 3},
    cloudCapFx: {position: 'absolute', top: -9, left: 27, fontSize: 26, zIndex: 3, elevation: 3},
    darkCloudCompanion: {position: 'absolute', left: 21, bottom: 1, zIndex: 3, elevation: 3},
    rainbowTrail: {position: 'absolute', top: 43, left: 5, zIndex: 1, elevation: 1},
});
