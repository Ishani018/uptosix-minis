import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Gamepad2,
  Grid3X3,
  Shuffle,
  Brain,
  Wind,
  LayoutGrid,
  CircleDashed,
  Sparkles,
  Droplet,
  Box,
  Leaf
} from 'lucide-react-native';

// Calming, uniform soft palette
const COLORS = {
  background: '#FDFBF7', // Very soft warm cream
  card: '#FFFFFF',
  text: '#5B6963',       // Muted sage-grey for soft reading
  subtext: '#8B9C96',    // Lighter sage for descriptions
  accent: '#A3B8B0',     // Main soothing sage accent
  shadow: '#E8EBE9',
};

// Expanded list of soothing games
const GAMES = [
  { id: 'breathing', title: 'Breathing Circle', description: 'Inhale, exhale, relax.', icon: Wind, route: '/breathing', color: '#EBF5EA' },
  { id: 'zen', title: 'Zen Garden', description: 'Rake the sand, find peace.', icon: Sparkles, route: '/zen', color: '#F5EFEA' },
  { id: 'puzzle', title: 'Mindful Puzzle', description: 'Rearrange the pieces to find harmony.', icon: Shuffle, route: '/puzzle', color: '#EAF4F5' },
  { id: 'bubble', title: 'Bubble Pop', description: 'Satisfying, gentle pops.', icon: CircleDashed, route: '/bubble', color: '#EAEBF5' },
  { id: 'snake', title: 'Snake Garden', description: 'A relaxing slide through the garden.', icon: Gamepad2, route: '/snake', color: '#EAF0EB' },
  { id: 'tic-tac-toe', title: 'Tic-Tac-Toe', description: 'Strategic simplicity in every turn.', icon: Grid3X3, route: '/tic-tac-toe', color: '#F0EAF5' },
  { id: 'memory', title: 'Memory Match', description: 'Gently train your recall.', icon: Brain, route: '/memory', color: '#F5EAEF' },
  { id: 'sudoku', title: 'Soft Sudoku', description: 'Numbers in perfect balance.', icon: LayoutGrid, route: '/sudoku', color: '#F5EEDA' },
  { id: 'colors', title: 'Color Sort', description: 'Organize the gradients.', icon: Droplet, route: '/colors', color: '#EAEFF5' },
  { id: '2048', title: 'Merge 2048', description: 'Combine blocks seamlessly.', icon: Box, route: '/2048', color: '#F5EAE5' },
];

export default function GameHub() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Leaf size={28} color={COLORS.background} strokeWidth={2.5} />
        </View>
        <Text style={styles.title}>MiniGame Hub</Text>
        <Text style={styles.subtitle}>Select an activity to begin your mindful journey</Text>
      </View>

      <View style={styles.grid}>
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Pressable
              key={game.id}
              // @ts-ignore - Ignore strict routing types until files are actually created
              onPress={() => router.push(game.route)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: game.color }]}>
                <Icon size={28} color={COLORS.text} strokeWidth={2} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardDescription}>{game.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Take a deep breath and enjoy...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.subtext,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  grid: {
    width: '100%',
    gap: 16, // Softer spacing
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24, // Softer, rounder corners
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F4F7F6',
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.subtext,
    lineHeight: 18,
  },
  footer: {
    marginTop: 50,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.subtext,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});