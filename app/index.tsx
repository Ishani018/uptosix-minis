import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Gamepad2, Grid3X3, Shuffle, Trophy } from 'lucide-react-native';

const COLORS = {
  background: '#F0F4F8',
  card: '#FFFFFF',
  text: '#4A6FA5',
  accent: '#6B9080',
  shadow: '#D1D9E6',
};

const GAMES = [
  {
    id: 'snake',
    title: 'Snake Garden',
    description: 'A relaxing slide through the garden.',
    icon: Gamepad2,
    route: '/snake' as const,
    color: '#A4C3B2',
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    description: 'Strategic simplicity in every turn.',
    icon: Grid3X3,
    route: '/tic-tac-toe' as const,
    color: '#B8C0FF',
  },
  {
    id: 'puzzle',
    title: 'Mindful Puzzle',
    description: 'Rearrange the pieces to find harmony.',
    icon: Shuffle,
    route: '/puzzle' as const,
    color: '#CCE3DE',
  },
];

export default function GameHub() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Trophy size={24} color="#FFF" />
        </View>
        <Text style={styles.title}>MiniGame Hub</Text>
        <Text style={styles.subtitle}>Select a game to begin your mindful journey</Text>
      </View>

      <View style={styles.grid}>
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Pressable
              key={game.id}
              onPress={() => router.push(game.route)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: game.color }]}>
                <Icon size={32} color={COLORS.text} />
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
        <Text style={styles.footerText}>Ready for a challenge?</Text>
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.accent,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  grid: {
    width: '100%',
    maxWidth: 500,
    gap: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  footer: {
    marginTop: 60,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.accent,
    fontStyle: 'italic',
    opacity: 0.6,
  },
});
