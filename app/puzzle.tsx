import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, Shuffle } from 'lucide-react-native';

const GRID_SIZE = 3;
const { width } = Dimensions.get('window');

export default function SlidePuzzle() {
  const router = useRouter();
  const [tiles, setTiles] = useState<number[]>([]);
  const gridSize = Math.min(width - 64, 360);

  const init = useCallback(() => {
    let newTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    // Shuffle
    for (let i = 0; i < 200; i++) {
      const emptyIdx = newTiles.indexOf(0);
      const neighbors = [];
      const r = Math.floor(emptyIdx / GRID_SIZE);
      const c = emptyIdx % GRID_SIZE;
      if (r > 0) neighbors.push(emptyIdx - GRID_SIZE);
      if (r < GRID_SIZE - 1) neighbors.push(emptyIdx + GRID_SIZE);
      if (c > 0) neighbors.push(emptyIdx - 1);
      if (c < GRID_SIZE - 1) neighbors.push(emptyIdx + 1);
      const moveIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
      [newTiles[emptyIdx], newTiles[moveIdx]] = [newTiles[moveIdx], newTiles[emptyIdx]];
    }
    setTiles(newTiles);
  }, []);

  useEffect(() => { init(); }, [init]);

  const handlePress = (idx: number) => {
    const emptyIdx = tiles.indexOf(0);
    const r = Math.floor(idx / GRID_SIZE);
    const c = idx % GRID_SIZE;
    const er = Math.floor(emptyIdx / GRID_SIZE);
    const ec = emptyIdx % GRID_SIZE;

    if (Math.abs(r - er) + Math.abs(c - ec) === 1) {
      const nextTiles = [...tiles];
      [nextTiles[idx], nextTiles[emptyIdx]] = [nextTiles[emptyIdx], nextTiles[idx]];
      setTiles(nextTiles);
    }
  };

  const isWon = tiles.length > 0 && tiles.slice(0, -1).every((t, i) => t === i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}><ArrowLeft size={22} color="#3D4A47" /></Pressable>
        <Text style={styles.title}>Puzzle</Text>
        <Pressable style={styles.iconBtn} onPress={init}><Shuffle size={20} color="#3D4A47" /></Pressable>
      </View>
      <Text style={styles.subtitle}>{isWon ? "All things in their place." : "Slide tiles to order numbers 1-8. Be patient."}</Text>
      
      <View style={[styles.grid, { width: gridSize, height: gridSize }]}>
        {tiles.map((t, i) => (
          <Pressable key={i} style={[styles.tile, t === 0 && styles.emptyTile, { width: (gridSize - 24) / 3, height: (gridSize - 24) / 3 }]} onPress={() => handlePress(i)}>
            {t !== 0 && <Text style={styles.tileText}>{t}</Text>}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, width: '100%' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#3D4A47' },
  subtitle: { fontSize: 13, color: '#9AACA6', textAlign: 'center', marginBottom: 30, lineHeight: 18 },
  grid: { backgroundColor: '#EDE7D9', padding: 8, borderRadius: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tile: { backgroundColor: '#FFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  emptyTile: { backgroundColor: '#EDE7D9', elevation: 0 },
  tileText: { fontSize: 24, fontWeight: '700', color: '#6B9080' },
});
