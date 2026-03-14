import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { RefreshCcw } from 'lucide-react-native';

const COLORS = {
  background: '#F0F4F8',
  boardBg: '#A4C3B2',
  cell: '#FFFFFF',
  textX: '#4A6FA5', // Soothing Blue
  textO: '#6B9080', // Soft Green
  textMenu: '#4A6FA5',
  button: '#E0EBE8', // Pale Mint
};

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fake loading to ensure a smooth, calming transition per constraints
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handlePress = (index: number) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  if (isLoading) return <LoadingScreen message="Setting up the board" />;

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {winner ? `Winner: ${winner}` : isDraw ? "It's a draw" : `Turn: ${xIsNext ? 'X' : 'O'}`}
      </Text>

      <View style={styles.board}>
        {board.map((cell, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
            onPress={() => handlePress(index)}
          >
            <Text style={[styles.cellText, cell === 'X' ? styles.colorX : styles.colorO]}>
              {cell}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={resetGame}>
        <RefreshCcw size={20} color={COLORS.textMenu} />
        <Text style={styles.buttonText}>Restart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '500',
    color: COLORS.textMenu,
    marginBottom: 40,
    letterSpacing: 1,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.boardBg,
    borderRadius: 16,
    padding: 8,
    gap: 8,
  },
  cell: {
    width: '31%',
    height: '31%',
    backgroundColor: COLORS.cell,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cellPressed: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
  },
  cellText: {
    fontSize: 48,
    fontWeight: '300', // elegant, thin font weight
  },
  colorX: { color: COLORS.textX },
  colorO: { color: COLORS.textO },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.button,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 50,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMenu,
  },
});
