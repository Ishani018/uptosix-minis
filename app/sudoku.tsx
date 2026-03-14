import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const INITIAL_BOARD = [
    [1, 0, 0, 4],
    [0, 4, 1, 0],
    [0, 1, 4, 0],
    [4, 0, 0, 1]
];
const SOLUTION = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1]
];

export default function SoftSudoku() {
    const router = useRouter();
    const [board, setBoard] = useState(INITIAL_BOARD.map(row => [...row]));
    const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);

    const handleNumberPress = (num: number) => {
        if (!selectedCell || INITIAL_BOARD[selectedCell.r][selectedCell.c] !== 0) return;
        const newBoard = [...board];
        newBoard[selectedCell.r][selectedCell.c] = num;
        setBoard(newBoard);
    };

    const isWon = JSON.stringify(board) === JSON.stringify(SOLUTION);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}><ArrowLeft size={24} color="#5B6963" /></Pressable>
                <Text style={styles.title}>Soft Sudoku</Text>
                <Pressable style={styles.iconButton} onPress={() => setBoard(INITIAL_BOARD.map(r => [...r]))}><RotateCcw size={24} color="#5B6963" /></Pressable>
            </View>
            <Text style={styles.subtitle}>{isWon ? "Perfect balance achieved." : "Fill the grid with 1, 2, 3, 4."}</Text>

            <View style={styles.board}>
                {board.map((row, r) => (
                    <View key={r} style={styles.row}>
                        {row.map((cell, c) => (
                            <Pressable
                                key={c}
                                style={[
                                    styles.cell,
                                    selectedCell?.r === r && selectedCell?.c === c && styles.selectedCell,
                                    INITIAL_BOARD[r][c] !== 0 && styles.fixedCell
                                ]}
                                onPress={() => setSelectedCell({ r, c })}
                            >
                                <Text style={[styles.cellText, INITIAL_BOARD[r][c] !== 0 && styles.fixedText]}>
                                    {cell !== 0 ? cell : ''}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                ))}
            </View>

            <View style={styles.numpad}>
                {[1, 2, 3, 4].map(num => (
                    <Pressable key={num} style={styles.numBtn} onPress={() => handleNumberPress(num)}>
                        <Text style={styles.numBtnText}>{num}</Text>
                    </Pressable>
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
    subtitle: { fontSize: 16, color: '#8B9C96', textAlign: 'center', marginBottom: 40 },
    board: { alignSelf: 'center', backgroundColor: '#EAEAEA', padding: 4, borderRadius: 12, gap: 4 },
    row: { flexDirection: 'row', gap: 4 },
    cell: { width: 60, height: 60, backgroundColor: '#FFFFFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    selectedCell: { backgroundColor: '#EAF4F5', borderWidth: 2, borderColor: '#A3B8B0' },
    fixedCell: { backgroundColor: '#F4F7F6' },
    cellText: { fontSize: 24, color: '#A3B8B0', fontWeight: '600' },
    fixedText: { color: '#5B6963' },
    numpad: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 40 },
    numBtn: { width: 50, height: 50, backgroundColor: '#A3B8B0', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    numBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
});