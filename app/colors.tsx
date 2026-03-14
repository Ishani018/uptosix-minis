import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const CORRECT_ORDER = ['#D4E0DC', '#C2D1CB', '#A3B8B0', '#859E95', '#6B857A'];

export default function ColorSort() {
    const router = useRouter();
    const [colors, setColors] = useState<string[]>([]);
    const [selected, setSelected] = useState<number | null>(null);

    const initialize = () => {
        let shuffled;
        do { shuffled = [...CORRECT_ORDER].sort(() => Math.random() - 0.5); }
        while (JSON.stringify(shuffled) === JSON.stringify(CORRECT_ORDER));
        setColors(shuffled);
        setSelected(null);
    };

    useEffect(() => { initialize(); }, []);

    const handlePress = (index: number) => {
        if (selected === null) {
            setSelected(index);
        } else {
            const newColors = [...colors];
            [newColors[selected], newColors[index]] = [newColors[index], newColors[selected]];
            setColors(newColors);
            setSelected(null);
        }
    };

    const isWon = JSON.stringify(colors) === JSON.stringify(CORRECT_ORDER);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}><ArrowLeft size={24} color="#5B6963" /></Pressable>
                <Text style={styles.title}>Color Sort</Text>
                <Pressable style={styles.iconButton} onPress={initialize}><RotateCcw size={24} color="#5B6963" /></Pressable>
            </View>
            <Text style={styles.subtitle}>{isWon ? "Harmony restored." : "Tap two blocks to swap and create a gradient."}</Text>

            <View style={styles.row}>
                {colors.map((color, index) => (
                    <Pressable
                        key={index}
                        style={[styles.block, { backgroundColor: color }, selected === index && styles.selected]}
                        onPress={() => handlePress(index)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: '#5B6963' },
    subtitle: { fontSize: 16, color: '#8B9C96', textAlign: 'center', marginBottom: 60 },
    row: { flexDirection: 'row', justifyContent: 'center', gap: 8, height: 100 },
    block: { flex: 1, borderRadius: 12 },
    selected: { transform: [{ scale: 1.1 }], shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
});