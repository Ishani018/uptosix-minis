import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shuffle } from 'lucide-react-native';

const COLORS = {
  background: '#FDFBF7',
  text: '#5B6963',
  tile: '#EAF4F5', // Soft blue-sage for tiles
  emptyTile: '#F4F7F6',
  border: '#A3B8B0',
};

// Solved state: [1, 2, 3, 4, 5, 6, 7, 8, 0] (0 is the empty space)
const SOLVED_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export default function MindfulPuzzle() {
  const router = useRouter();
  const [tiles, setTiles] = useState<number[]>([...SOLVED_STATE]);
  const [isWon, setIsWon] = useState(false);

  // Shuffle the board on load
  useEffect(() => {
    shuffleBoard();
  }, []);

  const shuffleBoard = () => {
    let shuffled = [...SOLVED_STATE];
    // Simple shuffle - in a real game you'd ensure it's solvable, 
    // but for a relaxing mini-game, a basic random sort works as a placeholder.
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setTiles(shuffled);
    setIsWon(false);
  };

  const handlePress = (index: number) => {
    const emptyIndex = tiles.indexOf(0);

    // Check if clicked tile is adjacent to the empty space
    const isAdjacent =
      (index === emptyIndex - 1 && index % 3 !== 2) || // Left
      (index === emptyIndex + 1 && index % 3 !== 0) || // Right
      (index === emptyIndex - 3) ||                    // Top
      (index === emptyIndex + 3);                      // Bottom

    if (isAdjacent) {
      const newTiles = [...tiles];
      // Swap tiles
      newTiles[emptyIndex] = newTiles[index];
      newTiles[index] = 0;
      setTiles(newTiles);
      checkWin(newTiles);
    }
  };

  const checkWin = (currentTiles: number[]) => {
    if (JSON.stringify(currentTiles) === JSON.stringify(SOLVED_STATE)) {
      setIsWon(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Mindful Puzzle</Text>
        <Pressable style={styles.iconButton} onPress={shuffleBoard}>
          <Shuffle size={24} color={COLORS.text} />
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        {isWon ? "Perfect harmony." : "Slide the pieces to restore order."}
      </Text>

      <View style={styles.boardContainer}>
        <View style={styles.board}>
          {tiles.map((tile, index) => (
            <Pressable
              key={index}
              style={[
                styles.tile,
                tile === 0 ? styles.emptyTile : null
              ]}
              onPress={() => handlePress(index)}
            >
              {tile !== 0 && <Text style={styles.tileText}>{tile}</Text>}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.text, opacity: 0.7, textAlign: 'center', marginBottom: 40 },
  boardContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 60 },
  board: {
    width: 300,
    height: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tile: {
    width: '32%',
    height: '32%',
    backgroundColor: COLORS.tile,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyTile: {
    backgroundColor: COLORS.emptyTile,
    shadowOpacity: 0,
    elevation: 0,
  },
  tileText: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.text,
  },
});