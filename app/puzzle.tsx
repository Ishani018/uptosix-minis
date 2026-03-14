import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { RefreshCcw } from 'lucide-react-native';

const COLORS = {
  background: '#F0F4F8',
  board: '#A4C3B2',
  tile: '#FFFFFF',
  empty: 'transparent',
  text: '#4A6FA5',
  success: '#6B9080',
  button: '#CCE3DE',
};

const WINNING_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Solvable random state for a quick play
const INITIAL_STATE = [1, 2, 3, 4, 0, 5, 7, 8, 6]; 

export default function PuzzleGame() {
  const [board, setBoard] = useState<number[]>(INITIAL_STATE);
  const [isWon, setIsWon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (board.join(',') === WINNING_STATE.join(',')) {
      setIsWon(true);
    } else {
      setIsWon(false);
    }
  }, [board]);

  const handlePress = (index: number) => {
    if (isWon) return;

    const emptyIndex = board.indexOf(0);
    const isAdjacent = 
      (Math.abs(emptyIndex - index) === 1 && Math.floor(emptyIndex / 3) === Math.floor(index / 3)) || 
      Math.abs(emptyIndex - index) === 3;

    if (isAdjacent) {
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      setBoard(newBoard);
    }
  };

  const shuffleBoard = () => {
    // Basic shuffle - in a real app we'd verify solvability
    // For now we just reset to our known playable state or a simple variation
    setBoard([4, 1, 3, 7, 2, 5, 8, 0, 6]); 
    setIsWon(false);
  };

  if (isLoading) return <LoadingScreen message="Arranging the pieces" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isWon ? "Perfect Harmony!" : "Mindful Puzzle"}
      </Text>
      
      {isWon && <Text style={styles.subtitle}>You solved it beautifully.</Text>}

      <View style={styles.board}>
        {board.map((tile, index) => (
          <Pressable
            key={index}
            style={[
              styles.tile,
              tile === 0 ? styles.tileEmpty : styles.tileFilled,
            ]}
            onPress={() => handlePress(index)}
          >
            {tile !== 0 && (
              <Text style={styles.tileText}>{tile}</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={shuffleBoard}>
        <RefreshCcw size={20} color={COLORS.text} />
        <Text style={styles.buttonText}>Shuffle</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.success,
    marginBottom: 20,
    fontWeight: '500',
  },
  board: {
    width: 320,
    height: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.board,
    borderRadius: 16,
    padding: 8,
    gap: 8,
    marginTop: 20,
  },
  tile: {
    width: '31%',
    height: '31%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileFilled: {
    backgroundColor: COLORS.tile,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tileEmpty: {
    backgroundColor: COLORS.empty,
  },
  tileText: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.text,
  },
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
    color: COLORS.text,
  },
});
