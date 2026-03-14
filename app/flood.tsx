import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GRID_SIZE = 12;
const CELL_SIZE = Math.floor((width - 48 - 20) / GRID_SIZE);

const COLORS = {
  background: '#FDFBF7',
  text: '#5B6963',
  palette: ['#EBF5EA', '#F5EFEA', '#EAF4F5', '#EAEBF5', '#F0EAF5', '#F5EAEF'],
};

export default function HarmoniousFlood() {
  const router = useRouter();
  const [grid, setGrid] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    const newGrid = Array(GRID_SIZE).fill(0).map(() => 
      Array(GRID_SIZE).fill(0).map(() => Math.floor(Math.random() * COLORS.palette.length))
    );
    setGrid(newGrid);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const flood = (targetColor: number) => {
    const startColor = grid[0][0];
    if (startColor === targetColor) return;

    const newGrid = grid.map(row => [...row]);
    const queue = [[0, 0]];
    const seen = new Set(['0,0']);

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      newGrid[r][c] = targetColor;

      [[r-1, c], [r+1, c], [r, c-1], [r, c+1]].forEach(([nr, nc]) => {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && 
            newGrid[nr][nc] === startColor && !seen.has(`${nr},${nc}`)) {
          seen.add(`${nr},${nc}`);
          queue.push([nr, nc]);
        }
      });
    }

    setGrid(newGrid);
    setMoves(m => m + 1);
  };

  const isWon = grid.length > 0 && grid.every(row => row.every(cell => cell === grid[0][0]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Harmonious Flood</Text>
        <Pressable style={styles.iconButton} onPress={initGame}>
          <RotateCcw size={24} color={COLORS.text} />
        </Pressable>
      </View>
      
      <Text style={styles.subtitle}>
        {isWon ? `Harmony restored in ${moves} ripples.` : "Start at top-left. Unify the board in waves of color."}
      </Text>

      <View style={styles.board}>
        {grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => (
              <View 
                key={c} 
                style={[styles.cell, { backgroundColor: COLORS.palette[cell], width: CELL_SIZE, height: CELL_SIZE }]} 
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.palette}>
        {COLORS.palette.map((color, idx) => (
          <Pressable 
            key={idx} 
            onPress={() => !isWon && flood(idx)}
            style={[styles.paletteBtn, { backgroundColor: color }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.text, opacity: 0.7, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  board: { alignSelf: 'center', borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  cell: {},
  palette: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 40 },
  paletteBtn: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    borderWidth: 4, 
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});
