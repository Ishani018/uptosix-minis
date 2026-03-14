import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const GRADIENTS = [
  ['#D4E0DC', '#BCCFC8', '#A3B8B0', '#8BA198', '#738A80', '#5B7368', '#445C51', '#2F453B'],
  ['#F5EAEF', '#ECCFD9', '#E4B4C4', '#DB99AF', '#D37E9A', '#CB6384', '#C2486F', '#B92E5A'],
  ['#EAF4F5', '#D0E5E8', '#B7D6DB', '#9DC7CE', '#84B8C1', '#6AA9B4', '#519AA7', '#378B9A'],
  ['#FFF1E6', '#FDE2E4', '#FAD2E1', '#E2ECE9', '#BEE1E6', '#DFE7FD', '#F0EFEB', '#C9E4DE'],
  ['#CAF0F8', '#ADE8F4', '#90E0EF', '#48CAE4', '#00B4D8', '#0096C7', '#0077B6', '#023E8A'],
];

export default function ColorSort() {
  const router = useRouter();
  const [colors, setColors] = useState<string[]>([]);
  const [target, setTarget] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);

  const init = useCallback(() => {
    const g = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    setTarget(g);
    setColors([...g].sort(() => Math.random() - 0.5));
    setSelected(null);
    setMoves(0);
  }, []);

  useEffect(() => { init(); }, [init]);

  const handlePress = (idx: number) => {
    if (selected === null) {
      setSelected(idx);
    } else {
      let next = [...colors];
      [next[selected], next[idx]] = [next[idx], next[selected]];
      setColors(next);
      setSelected(null);
      setMoves(m => m + 1);
    }
  };

  const isWon = JSON.stringify(colors) === JSON.stringify(target);

  useEffect(() => {
    if (!isWon || moves === 0) return;
    setBestMoves(prev => (prev === null || moves < prev ? moves : prev));
  }, [isWon, moves]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}><ArrowLeft size={22} color="#5B6963" /></Pressable>
        <Text style={styles.title}>Color Sort</Text>
        <Pressable style={styles.iconBtn} onPress={init}><RotateCcw size={22} color="#5B6963" /></Pressable>
      </View>
      <Text style={styles.subtitle}>{isWon ? "Harmony restored." : "Tap two blocks to swap. Restore the gradient."}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.statText}>Moves: {moves}</Text>
        {bestMoves !== null && <Text style={styles.statText}>Best: {bestMoves}</Text>}
      </View>
      
      <View style={styles.grid}>
        {colors.map((c, i) => (
          <Pressable key={i} onPress={() => handlePress(i)} style={[styles.block, { backgroundColor: c }, selected === i && styles.selected]} />
        ))}
      </View>
      {isWon && (
        <Text style={styles.win}>
          Perfect Balance {moves > 0 ? `· ${moves} moves` : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#5B6963' },
  subtitle: { fontSize: 13, color: '#8B9C96', textAlign: 'center', marginBottom: 30 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 16 },
  statText: { fontSize: 12, color: '#8B9C96' },
  grid: { gap: 8 },
  block: { height: 48, borderRadius: 12 },
  selected: { borderWidth: 3, borderColor: '#FFF', transform: [{ scale: 1.05 }] },
  win: { marginTop: 30, fontSize: 18, fontWeight: '700', color: '#5B6963', textAlign: 'center', letterSpacing: 2 },
});
