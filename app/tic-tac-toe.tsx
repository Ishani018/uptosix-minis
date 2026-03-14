import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function TicTacToe() {
  const router = useRouter();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const gridSize = Math.min(width - 64, 320);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  const winner = calculateWinner(board);
  const status = winner ? `Winner: ${winner}` : board.every(s => s) ? "Draw" : `Next: ${xIsNext ? 'X' : 'O'}`;

  const handlePress = (i: number) => {
    if (board[i] || winner) return;
    const next = [...board];
    next[i] = xIsNext ? 'X' : 'O';
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  const init = () => { setBoard(Array(9).fill(null)); setXIsNext(true); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}><ArrowLeft size={22} color="#3D4A47" /></Pressable>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <Pressable style={styles.iconBtn} onPress={init}><RotateCcw size={22} color="#3D4A47" /></Pressable>
      </View>
      <Text style={styles.subtitle}>{status}</Text>
      <View style={[styles.grid, { width: gridSize, height: gridSize }]}>
        {board.map((s, i) => (
          <Pressable key={i} style={[styles.cell, { width: (gridSize - 16) / 3, height: (gridSize - 16) / 3 }]} onPress={() => handlePress(i)}>
            <Text style={[styles.cellText, s === 'X' ? { color: '#6B9080' } : { color: '#C0605A' }]}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#3D4A47' },
  subtitle: { fontSize: 18, color: '#9AACA6', marginBottom: 40, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#EDE7D9', padding: 8, borderRadius: 12, gap: 4 },
  cell: { backgroundColor: '#FFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cellText: { fontSize: 40, fontWeight: '700' },
});
