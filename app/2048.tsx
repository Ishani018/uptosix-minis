import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';

type Grid = number[][];

const COLORS: Record<number | string, string> = {
  background: '#FDFBF7',
  text: '#5B6963',
  board: '#EAEAEA',
  empty: '#F4F7F6',
  2: '#EBF5EA',
  4: '#F5EFEA',
  8: '#EAF4F5',
  16: '#EAEBF5',
  32: '#F0EAF5',
  64: '#F5EAEF',
  128: '#F5EEDA',
  256: '#EAEFF5',
  512: '#F5EAE5',
  default: '#FDFBF7',
};

export default function Merge2048() {
  const router = useRouter();
  const [grid, setGrid] = useState<Grid>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);

  const initGame = () => {
    let newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
  };

  const addRandomTile = (currentGrid: Grid) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    let newGrid = grid.map(row => [...row]);
    let moved = false;

    const rotate = (g: Grid) => g[0].map((_, i) => g.map(row => row[i]).reverse());

    if (direction === 'UP') {
      newGrid = rotate(rotate(rotate(newGrid)));
    } else if (direction === 'DOWN') {
      newGrid = rotate(newGrid);
    } else if (direction === 'LEFT') {
      // already in correct orientation for horizontal shift
    } else if (direction === 'RIGHT') {
      newGrid = rotate(rotate(newGrid));
    }

    // Shift and merge
    for (let i = 0; i < 4; i++) {
        let row = newGrid[i].filter(val => val !== 0);
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j+1]) {
                row[j] *= 2;
                setScore(s => s + row[j]);
                row.splice(j + 1, 1);
                moved = true;
            }
        }
        while (row.length < 4) row.push(0);
        if (JSON.stringify(newGrid[i]) !== JSON.stringify(row)) moved = true;
        newGrid[i] = row;
    }

    // Rotate back
    if (direction === 'UP') {
      newGrid = rotate(newGrid);
    } else if (direction === 'DOWN') {
      newGrid = rotate(rotate(rotate(newGrid)));
    } else if (direction === 'RIGHT') {
      newGrid = rotate(rotate(newGrid));
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Merge 2048</Text>
        <Pressable style={styles.iconButton} onPress={initGame}>
          <RotateCcw size={24} color={COLORS.text} />
        </Pressable>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Harmony Points</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      <View style={styles.board}>
        {grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => (
              <View key={c} style={[styles.tile, { backgroundColor: COLORS[cell] || COLORS.default }]}>
                {cell !== 0 && <Text style={styles.tileText}>{cell}</Text>}
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.btn} onPress={() => move('UP')}><ChevronUp size={32} color="#FFF" /></Pressable>
        <View style={styles.controlRow}>
          <Pressable style={styles.btn} onPress={() => move('LEFT')}><ChevronLeft size={32} color="#FFF" /></Pressable>
          <Pressable style={styles.btn} onPress={() => move('DOWN')}><ChevronDown size={32} color="#FFF" /></Pressable>
          <Pressable style={styles.btn} onPress={() => move('RIGHT')}><ChevronRight size={32} color="#FFF" /></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#5B6963' },
  scoreContainer: { alignItems: 'center', marginBottom: 30 },
  scoreLabel: { fontSize: 13, color: '#8B9C96', textTransform: 'uppercase', letterSpacing: 1 },
  scoreValue: { fontSize: 32, fontWeight: '700', color: '#5B6963' },
  board: { alignSelf: 'center', width: 300, height: 300, backgroundColor: '#EAEAEA', borderRadius: 16, padding: 8, gap: 8 },
  row: { flex: 1, flexDirection: 'row', gap: 8 },
  tile: { flex: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tileText: { fontSize: 24, fontWeight: '700', color: '#5B6963' },
  controls: { alignItems: 'center', marginTop: 40, gap: 10 },
  controlRow: { flexDirection: 'row', gap: 10 },
  btn: { width: 62, height: 62, backgroundColor: '#A3B8B0', borderRadius: 31, justifyContent: 'center', alignItems: 'center', shadowColor: '#A3B8B0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
});