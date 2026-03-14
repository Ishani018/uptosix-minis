import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const COLORS = { background: '#FDFBF7', text: '#5B6963', hidden: '#EAEAEA', shadow: '#D1D9E6' };
const CARD_COLORS = ['#A3B8B0', '#B8C0FF', '#F5EAEF', '#F5EEDA', '#EAF4F5', '#EAEBF5', '#F0EAF5', '#F5EFEA'];

export default function MemoryMatch() {
    const router = useRouter();
    const [cards, setCards] = useState<{ color: string; id: number; isFlipped: boolean; isMatched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

    const initializeGame = () => {
        const deck = [...CARD_COLORS, ...CARD_COLORS]
            .sort(() => Math.random() - 0.5)
            .map((color, index) => ({ color, id: index, isFlipped: false, isMatched: false }));
        setCards(deck);
        setFlippedIndices([]);
    };

    useEffect(() => { initializeGame(); }, []);

    const handleCardPress = (index: number) => {
        if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setTimeout(() => {
                const [first, second] = newFlipped;
                if (newCards[first].color === newCards[second].color) {
                    newCards[first].isMatched = true;
                    newCards[second].isMatched = true;
                } else {
                    newCards[first].isFlipped = false;
                    newCards[second].isFlipped = false;
                }
                setCards([...newCards]);
                setFlippedIndices([]);
            }, 800);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}><ArrowLeft size={24} color={COLORS.text} /></Pressable>
                <Text style={styles.title}>Memory Match</Text>
                <Pressable style={styles.iconButton} onPress={initializeGame}><RotateCcw size={24} color={COLORS.text} /></Pressable>
            </View>
            <Text style={styles.subtitle}>Find the matching pairs gently.</Text>
            <View style={styles.grid}>
                {cards.map((card, index) => (
                    <Pressable key={card.id} style={[styles.card, { backgroundColor: card.isFlipped || card.isMatched ? card.color : COLORS.hidden }]} onPress={() => handleCardPress(index)} />
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
    subtitle: { fontSize: 16, color: COLORS.text, opacity: 0.7, textAlign: 'center', marginBottom: 40 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 350, alignSelf: 'center' },
    card: { width: '21%', aspectRatio: 1, borderRadius: 12, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
});