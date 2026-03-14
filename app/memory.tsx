import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const ICONS = ['🌸', '🍃', '🌊', '☀️', '🌙', '☁️', '💎', '🌿'];

export default function MemoryMatch() {
  const router = useRouter();
  const [cards, setCards] = useState<{ id: number; val: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const init = useCallback(() => {
    const doubled = [...ICONS, ...ICONS];
    const shuffled = doubled.sort(() => Math.random() - 0.5).map((v, i) => ({ id: i, val: v, flipped: false, matched: false }));
    setCards(shuffled);
    setSelected([]);
  }, []);

  useEffect(() => { init(); }, [init]);

  const handlePress = (idx: number) => {
    if (cards[idx].flipped || cards[idx].matched || selected.length >= 2) return;
    const nextCards = [...cards];
    nextCards[idx].flipped = true;
    setCards(nextCards);
    const nextSelected = [...selected, idx];
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      const [i1, i2] = nextSelected;
      if (cards[i1].val === cards[i2].val) {
        nextCards[i1].matched = true;
        nextCards[i2].matched = true;
        setSelected([]);
      } else {
        setTimeout(() => {
          nextCards[i1].flipped = false;
          nextCards[i2].flipped = false;
          setCards([...nextCards]);
          setSelected([]);
        }, 1000);
      }
    }
  };

  const isWon = cards.length > 0 && cards.every(c => c.matched);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}><ArrowLeft size={22} color="#3D4A47" /></Pressable>
        <Text style={styles.title}>Memory</Text>
        <Pressable style={styles.iconBtn} onPress={init}><RotateCcw size={22} color="#3D4A47" /></Pressable>
      </View>
      <Text style={styles.subtitle}>{isWon ? "A clear and focused mind." : "Find the pairs. Quiet your thoughts."}</Text>
      
      <View style={styles.grid}>
        {cards.map((c, i) => (
          <Pressable key={c.id} style={[styles.card, (c.flipped || c.matched) && styles.cardFlipped]} onPress={() => handlePress(i)}>
            <Text style={styles.cardText}>{(c.flipped || c.matched) ? c.val : '?'}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#3D4A47' },
  subtitle: { fontSize: 13, color: '#9AACA6', textAlign: 'center', marginBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: { width: 70, height: 90, backgroundColor: '#A4C3B2', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardFlipped: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#A4C3B2' },
  cardText: { fontSize: 32 },
});
