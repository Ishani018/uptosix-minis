import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const GRADIENTS = [
    ['#D4E0DC', '#BCCFC8', '#A3B8B0', '#8BA198', '#738A80', '#5B7368', '#445C51', '#2F453B'],
    ['#F5EAEF', '#ECCFD9', '#E4B4C4', '#DB99AF', '#D37E9A', '#CB6384', '#C2486F', '#B92E5A'],
    ['#EAF4F5', '#D0E5E8', '#B7D6DB', '#9DC7CE', '#84B8C1', '#6AA9B4', '#519AA7', '#378B9A'],
];

export default function ColorSort() {
    const router = useRouter();
    const [colors, setColors] = useState<string[]>([]);
    const [targetOrder, setTargetOrder] = useState<string[]>([]);
    const [selected, setSelected] = useState<number | null>(null);

    const initialize = () => {
        const randomGradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
        setTargetOrder(randomGradient);
        let shuffled;
        do { shuffled = [...randomGradient].sort(() => Math.random() - 0.5); }
        while (JSON.stringify(shuffled) === JSON.stringify(randomGradient));
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

    const isWon = JSON.stringify(colors) === JSON.stringify(targetOrder);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}><ArrowLeft size={24} color="#5B6963" /></Pressable>
                <Text style={styles.title}>Color Sort</Text>
                <Pressable style={styles.iconButton} onPress={initialize}><RotateCcw size={24} color="#5B6963" /></Pressable>
            </View>
            <Text style={styles.subtitle}>{isWon ? "The spectrum is in perfect harmony." : "Arrange the blocks into a smooth, calming gradient."}</Text>

            <View style={styles.grid}>
                {colors.map((color, index) => (
                    <Pressable
                        key={index}
                        style={[
                            styles.block, 
                            { backgroundColor: color }, 
                            selected === index && styles.selectedBlock
                        ]}
                        onPress={() => handlePress(index)}
                    >
                        {selected === index && <View style={styles.selectionIndicator} />}
                    </Pressable>
                ))}
            </View>

            {isWon && (
                <View style={styles.winBanner}>
                    <Text style={styles.winText}>Peace Restored</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: '#5B6963' },
    subtitle: { fontSize: 16, color: '#8B9C96', textAlign: 'center', marginBottom: 60, paddingHorizontal: 20, lineHeight: 22 },
    grid: { flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300, alignSelf: 'center' },
    block: { height: 50, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    selectedBlock: { transform: [{ scale: 1.05 }], shadowOpacity: 0.3, shadowRadius: 10, zIndex: 10 },
    selectionIndicator: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
    winBanner: { marginTop: 40, alignItems: 'center' },
    winText: { fontSize: 20, fontWeight: '700', color: '#5B6963', letterSpacing: 2, textTransform: 'uppercase' },
});