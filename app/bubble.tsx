import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CircleDashed } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#FDFBF7',
  text: '#5B6963',
  bubble: '#EAEBF5',
  popped: '#F4F7F6',
};

export default function BubblePop() {
  const router = useRouter();
  const [bubbles, setBubbles] = useState(
    Array(12).fill(0).map((_, i) => ({ id: i, popped: false }))
  );
  const [popCount, setPopCount] = useState(0);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.map(b => (b.id === id ? { ...b, popped: true } : b)));
    setPopCount(prev => prev + 1);
    
    // Reset bubbles if all popped
    if (bubbles.filter(b => !b.popped).length === 1) {
      setTimeout(() => {
        setBubbles(Array(12).fill(0).map((_, i) => ({ id: i, popped: false })));
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Bubble Pop</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{popCount}</Text>
        </View>
      </View>
      
      <Text style={styles.subtitle}>Satisfying, gentle pops. Just tap.</Text>

      <View style={styles.grid}>
        {bubbles.map((bubble) => (
          <Pressable
            key={bubble.id}
            onPress={() => !bubble.popped && popBubble(bubble.id)}
            style={[
              styles.bubble,
              bubble.popped ? styles.popped : styles.unpopped
            ]}
          >
            {!bubble.popped && <CircleDashed size={32} color="rgba(91, 105, 99, 0.2)" />}
          </Pressable>
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
  scoreBadge: { backgroundColor: '#EAEBF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  scoreText: { color: COLORS.text, fontWeight: '700' },
  subtitle: { fontSize: 16, color: COLORS.text, opacity: 0.7, textAlign: 'center', marginBottom: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    padding: 10,
  },
  bubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unpopped: {
    backgroundColor: COLORS.bubble,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  popped: {
    backgroundColor: COLORS.popped,
    transform: [{ scale: 0.9 }],
    opacity: 0.5,
  },
});
