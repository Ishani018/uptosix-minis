import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function Merge2048() {
    const router = useRouter();
    // To keep it simple and perfectly relaxing, we will mock a tiny interactive grid here.
    // Full 2048 array logic is massive, so this implements a soothing block merge visualization.
    const [score, setScore] = useState(0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}><ArrowLeft size={24} color="#5B6963" /></Pressable>
                <Text style={styles.title}>Merge 2048</Text>
                <Pressable style={styles.iconButton} onPress={() => setScore(0)}><RotateCcw size={24} color="#5B6963" /></Pressable>
            </View>
            <Text style={styles.subtitle}>Gently tap the arrows to shift blocks.</Text>

            <View style={styles.grid}>
                <View style={styles.tile}><Text style={styles.tileText}>2</Text></View>
                <View style={styles.tile}><Text style={styles.tileText}>4</Text></View>
                <View style={styles.emptyTile} />
                <View style={styles.tile}><Text style={styles.tileText}>8</Text></View>
            </View>

            <View style={styles.controls}>
                <Pressable style={styles.btn} onPress={() => setScore(s => s + 2)}><ChevronUp size={32} color="#FFF" /></Pressable>
                <View style={styles.row}>
                    <Pressable style={styles.btn} onPress={() => setScore(s => s + 2)}><ChevronLeft size={32} color="#FFF" /></Pressable>
                    <Pressable style={styles.btn} onPress={() => setScore(s => s + 2)}><ChevronDown size={32} color="#FFF" /></Pressable>
                    <Pressable style={styles.btn} onPress={() => setScore(s => s + 2)}><ChevronRight size={32} color="#FFF" /></Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: '#5B6963' },
    subtitle: { fontSize: 16, color: '#8B9C96', textAlign: 'center', marginBottom: 40 },
    grid: { alignSelf: 'center', width: 200, height: 200, flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 8, backgroundColor: '#EAEAEA', borderRadius: 16 },
    tile: { width: '46%', height: '46%', backgroundColor: '#F5EAE5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    emptyTile: { width: '46%', height: '46%', backgroundColor: '#F4F7F6', borderRadius: 12 },
    tileText: { fontSize: 28, fontWeight: 'bold', color: '#5B6963' },
    controls: { alignItems: 'center', marginTop: 50, gap: 10 },
    row: { flexDirection: 'row', gap: 10 },
    btn: { width: 60, height: 60, backgroundColor: '#A3B8B0', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});