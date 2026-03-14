import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const COLORS = {
  background: '#FDFBF7', // Soft sand color
  text: '#5B6963',
  stone: '#A3B8B0',
  shadow: '#D1D9E6',
};

export default function ZenGarden() {
  const router = useRouter();
  const [stones, setStones] = useState<{ x: number; y: number; size: number; rotation: number }[]>([]);

  const placeStone = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    // Don't place stones too close to the edge
    const newStone = {
      x: locationX,
      y: locationY,
      size: Math.random() * 30 + 40, // Random size between 40 and 70
      rotation: Math.random() * 360,
    };
    setStones([...stones, newStone]);
  };

  const clearGarden = () => setStones([]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Zen Garden</Text>
        <Pressable style={styles.iconButton} onPress={clearGarden}>
          <RotateCcw size={24} color={COLORS.text} />
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Tap the sand to place a stone. Breathe.</Text>

      <Pressable style={styles.sandbox} onPress={placeStone}>
        {stones.map((stone, index) => (
          <View
            key={index}
            style={[
              styles.stone,
              {
                left: stone.x - stone.size / 2,
                top: stone.y - stone.size / 2,
                width: stone.size,
                height: stone.size * 0.8, // Slightly oval
                borderRadius: stone.size / 2,
                transform: [{ rotate: `${stone.rotation}deg` }],
              },
            ]}
          />
        ))}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.text, opacity: 0.7, textAlign: 'center', marginBottom: 30 },
  sandbox: {
    flex: 1,
    backgroundColor: '#FAF7F2', // Slightly darker sand for the playable area
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#EFEBE4',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stone: {
    position: 'absolute',
    backgroundColor: COLORS.stone,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
});