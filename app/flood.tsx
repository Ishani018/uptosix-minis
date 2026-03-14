import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const GRID_SIZE = 10;
const COLORS_LIST = ['#D4E0DC', '#F5EAEF', '#EAF4F5', '#EAEBF5', '#F5F5EA', '#F0EAF5'];

export default function ColorFlood() {
  const router = useRouter();
  const [grid, setGrid] = useState<string[][]>([]);
  const [moves, setMoves] = useState(0);
  const [targetColor, setTargetColor] = useState('');

  const init = useCallback(() => {
    const newGrid = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)])
    );
    setGrid(newGrid);
    setMoves(0);
    setTargetColor(newGrid[0][0]);
  }, []);

  useEffect(() => { init(); }, [init]);

  const flood = (newColor: string) => {
    if (newColor === grid[0][0]) return;
    const oldColor = grid[0][0];
    const newGrid = grid.map(r => [...r]);
    const queue = [[0, 0]];
    const visited = new Set(['0,0']);

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      newGrid[r][c] = newColor;

      [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([nr, nc]) => {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE &&
            !visited.has(`${nr},${nc}`) && newGrid[nr][nc] === oldColor) {
          visited.add(`${nr},${nc}`);
          queue.push([nr, nc]);
        }
      });
    }

    setGrid(newGrid);
    setMoves(m => m + 1);
  };

  const isWon = grid.length > 0 && grid.every(r => r.every(c => c === grid[0][0]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}><ArrowLeft size={22} color="#3D4A47" /></Pressable>
        <Text style={styles.title}>Color Flood</Text>
        <Pressable style={styles.iconBtn} onPress={init}><RotateCcw size={22} color="#3D4A47" /></Pressable>
      </View>
      <Text style={styles.subtitle}>{isWon ? "Unified in harmony." : `Fill the garden in 25 moves. Moves: ${moves}/25`}</Text>
      
      <View style={styles.grid}>
        {grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => (
              <View key={c} style={[styles.cell, { backgroundColor: cell }]} />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        {COLORS_LIST.map(c => (
          <Pressable key={c} style={[styles.colorBtn, { backgroundColor: c }]} onPress={() => flood(c)} />
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
  grid: { alignSelf: 'center', borderRadius: 8, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  cell: { width: 30, height: 30 },
  controls: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 40 },
  colorBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FFF', elevation: 2 },
});
