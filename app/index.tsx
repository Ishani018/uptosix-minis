import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import {
  CircleDashed, Sparkles, Droplet, LayoutGrid,
  Box, Leaf, Brain, Hash, Puzzle, Grid3X3,
} from 'lucide-react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_UNIT } from './hooks/ads';

const GAMES = [
  { id: 'sudoku', name: 'Sudoku', icon: Grid3X3, color: '#6B9080' },
  { id: '2048', name: '2048', icon: LayoutGrid, color: '#D4A843' },
  { id: 'bubble', name: 'Bubble Pop', icon: CircleDashed, color: '#E8B0BC' },
  { id: 'colors', name: 'Color Sort', icon: Sparkles, color: '#CB6384' },
  { id: 'flood', name: 'Color Flood', icon: Droplet, color: '#84B8C1' },
  { id: 'memory', name: 'Memory', icon: Brain, color: '#98C4D8' },
  { id: 'puzzle', name: 'Slide Puzzle', icon: Puzzle, color: '#C89A1E' },
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: Hash, color: '#E87E5A' },
  { id: 'snake', name: 'Snake Garden', icon: Leaf, color: '#6B9080' },
];

export default function GameHub() {
  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.logo}>✦ MINDFUL GAMES ✦</Text>
        <Text style={styles.tagline}>A quiet place for your focus.</Text>
        <View style={styles.grid}>
          {GAMES.map((game) => (
            <Link key={game.id} href={`/${game.id}`} asChild>
              <Pressable style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: game.color }]}>
                  <game.icon size={28} color="#FFF" />
                </View>
                <Text style={styles.gameName}>{game.name}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>

      {/* Banner ad pinned to the bottom of the hub */}
      <BannerAd
        unitId={BANNER_UNIT}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ keywords: ['games', 'puzzle', 'casual', 'relaxing'] }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FDFBF7' },
  scroll: { flex: 1 },
  content: { paddingTop: 80, paddingBottom: 20, paddingHorizontal: 24, alignItems: 'center' },
  logo: { fontSize: 24, fontWeight: '800', color: '#3D4A47', letterSpacing: 4, marginBottom: 8 },
  tagline: { fontSize: 13, color: '#9AACA6', marginBottom: 40, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  card: { width: '45%', backgroundColor: '#FFF', borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gameName: { fontSize: 14, fontWeight: '600', color: '#3D4A47' },
});