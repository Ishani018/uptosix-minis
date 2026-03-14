import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const PLAY_WIDTH = width - 48;
const PLAY_HEIGHT = height * 0.52;

const COLORS = {
  background: '#F7F3EE',
  text: '#3D4A47',
  textLight: '#9AACA6',
  accent: '#6B9080',
  streakGold: '#D4A843',
};

const BUBBLE_COLORS = [
  { bg: '#D6EAE4', border: '#A4C3B2', shine: 'rgba(255,255,255,0.55)' },
  { bg: '#D8D6EC', border: '#B8B0E0', shine: 'rgba(255,255,255,0.55)' },
  { bg: '#F5DDE2', border: '#E8B0BC', shine: 'rgba(255,255,255,0.55)' },
  { bg: '#F5EDD4', border: '#E8D090', shine: 'rgba(255,255,255,0.55)' },
  { bg: '#D4E8F0', border: '#98C4D8', shine: 'rgba(255,255,255,0.55)' },
  { bg: '#EDD4F0', border: '#C898D8', shine: 'rgba(255,255,255,0.55)' },
];

let _bId = 0;
const genId = () => ++_bId;

type BubbleData = {
  id: number;
  x: number;
  y: number;
  size: number;
  colorIdx: number;
  popped: boolean;
};

function makeBubbles(count: number): BubbleData[] {
  const bubbles: BubbleData[] = [];
  const attempts = count * 12;
  let placed = 0;

  for (let i = 0; i < attempts && placed < count; i++) {
    const size = 50 + Math.random() * 44; // 50–94px
    const x = Math.random() * (PLAY_WIDTH - size);
    const y = Math.random() * (PLAY_HEIGHT - size);
    const overlapping = bubbles.some(b => {
      const dx = b.x + b.size / 2 - (x + size / 2);
      const dy = b.y + b.size / 2 - (y + size / 2);
      return Math.sqrt(dx * dx + dy * dy) < (b.size / 2 + size / 2) * 0.65;
    });
    if (!overlapping) {
      bubbles.push({ id: genId(), x, y, size, colorIdx: Math.floor(Math.random() * BUBBLE_COLORS.length), popped: false });
      placed++;
    }
  }
  return bubbles;
}

function Bubble({ data, onPop }: { data: BubbleData; onPop: (id: number) => void }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const popOpacity = useRef(new Animated.Value(1)).current;
  const didPop = useRef(false);

  const { bg, border, shine } = BUBBLE_COLORS[data.colorIdx];

  useEffect(() => {
    const fy = 4 + Math.random() * 6;
    const fx = 2 + Math.random() * 3;
    const dy = 1800 + Math.random() * 1200;
    const dx = 2400 + Math.random() * 1600;
    const offsetY = Math.random() * 1000;
    const offsetX = Math.random() * 1000;

    const loopY = Animated.loop(
      Animated.sequence([
        Animated.delay(offsetY),
        Animated.timing(floatY, { toValue: -fy, duration: dy / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: fy, duration: dy / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const loopX = Animated.loop(
      Animated.sequence([
        Animated.delay(offsetX),
        Animated.timing(floatX, { toValue: -fx, duration: dx / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatX, { toValue: fx, duration: dx / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loopY.start();
    loopX.start();
    return () => { loopY.stop(); loopX.stop(); };
  }, [floatX, floatY]);

  const handlePop = () => {
    if (didPop.current || data.popped) return;
    didPop.current = true;
    Animated.parallel([
      Animated.sequence([
        Animated.timing(popScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.timing(popScale, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
      Animated.timing(popOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => onPop(data.id));
  };

  if (data.popped) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: data.x,
        top: data.y,
        transform: [{ translateY: floatY }, { translateX: floatX }, { scale: popScale }],
        opacity: popOpacity,
      }}
    >
      <Pressable onPress={handlePop}>
        <View
          style={{
            width: data.size,
            height: data.size,
            borderRadius: data.size / 2,
            backgroundColor: bg,
            borderWidth: 1.5,
            borderColor: border,
            shadowColor: border,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: data.size * 0.1,
              left: data.size * 0.18,
              width: data.size * 0.35,
              height: data.size * 0.22,
              borderRadius: data.size * 0.2,
              backgroundColor: shine,
            }}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function BubblePop() {
  const router = useRouter();
  const [bubbles, setBubbles] = useState<BubbleData[]>(() => makeBubbles(18));
  const [popCount, setPopCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const lastPopTime = useRef(0);
  const streakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streakAnim = useRef(new Animated.Value(0)).current;

  const handlePop = useCallback((id: number) => {
    const now = Date.now();
    const timeDiff = now - lastPopTime.current;
    lastPopTime.current = now;

    if (streakTimer.current) clearTimeout(streakTimer.current);
    const newStreak = timeDiff < 1200 ? streak + 1 : 1;
    setStreak(newStreak);
    setMaxStreak(ms => Math.max(ms, newStreak));

    if (newStreak >= 3) {
      Animated.sequence([
        Animated.timing(streakAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(streakAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }

    streakTimer.current = setTimeout(() => setStreak(0), 1200);

    setBubbles(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, popped: true } : b);
      const remaining = updated.filter(b => !b.popped);
      if (remaining.length <= 3) {
        setTimeout(() => {
          setBubbles(makeBubbles(18));
          setStreak(0);
        }, 500);
      }
      return updated;
    });
    setPopCount(c => c + 1);
  }, [streak, streakAnim]);

  const streakScale = streakAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] });
  const remainingCount = bubbles.filter(b => !b.popped).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}>
          <ArrowLeft size={22} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Bubble Pop</Text>
        <View style={styles.scoreBadge}><Text style={styles.scoreText}>{popCount}</Text></View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statValue}>{remainingCount}</Text><Text style={styles.statLabel}>Left</Text></View>
        <View style={styles.statDivider} />
        <Animated.View style={[styles.stat, { transform: [{ scale: streakScale }] }]}><Text style={[styles.statValue, streak >= 3 && { color: COLORS.streakGold }]}>{streak >= 2 ? `${streak}×` : '—'}</Text><Text style={styles.statLabel}>Streak</Text></Animated.View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={[styles.statValue, { color: maxStreak >= 3 ? COLORS.streakGold : COLORS.text }]}>{maxStreak >= 2 ? `${maxStreak}×` : '—'}</Text><Text style={styles.statLabel}>Best</Text></View>
      </View>

      <Text style={styles.subtitle}>Tap to pop. Feel the release.</Text>

      <View style={[styles.playArea, { width: PLAY_WIDTH, height: PLAY_HEIGHT }]}>
        {bubbles.map(b => <Bubble key={b.id} data={b} onPop={handlePop} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, paddingTop: 60, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 14 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  scoreBadge: { backgroundColor: '#DFF0EA', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  scoreText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 6 },
  stat: { alignItems: 'center', gap: 2, minWidth: 50 },
  statValue: { fontSize: 20, fontWeight: '300', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '500', letterSpacing: 0.4 },
  statDivider: { width: 1, height: 26, backgroundColor: '#DDD5C8' },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginBottom: 14 },
  playArea: { borderRadius: 28, backgroundColor: 'rgba(164,195,178,0.08)', borderWidth: 1.5, borderColor: 'rgba(164,195,178,0.2)', position: 'relative', overflow: 'hidden' },
});
