import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const COLORS = {
    background: '#FDFBF7',
    text: '#5B6963',
    accent: '#A3B8B0',
    cell: '#FFFFFF',
    fixed: '#F4F7F6',
    selected: '#EAF4F5',
    border: '#EAEAEA',
};

// Simplified 4x4 Sudoku Logic
const generateBoard = () => {
    // Basic 4x4 valid board template
    const base = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 3, 4, 1],
        [4, 1, 2, 3]
    ];
    
    // Shuffle rows and columns within their 2x2 blocks to randomize
    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
    
    const block1 = shuffle([0, 1]);
    const block2 = shuffle([2, 3]);
    const rowOrder = [...block1, ...block2];
    
    const colBlock1 = shuffle([0, 1]);
    const colBlock2 = shuffle([2, 3]);
    const colOrder = [...colBlock1, ...colBlock2];
    
    const randomized = rowOrder.map(r => colOrder.map(c => base[r][c]));
    
    // Create puzzle by removing elements
    const puzzle = randomized.map(row => row.map(cell => Math.random() > 0.4 ? cell : 0));
    
    return { puzzle, solution: randomized };
};

export default function SoftSudoku() {
    const router = useRouter();
    const [gameState, setGameState] = useState<{ puzzle: number[][], solution: number[][] } | null>(null);
    const [board, setBoard] = useState<number[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);

    const startNewGame = () => {
        const { puzzle, solution } = generateBoard();
        setGameState({ puzzle, solution });
        setBoard(puzzle.map(row => [...row]));
        setSelectedCell(null);
    };

    useEffect(() => {
        startNewGame();
    }, []);

    const handleNumberPress = (num: number) => {
        if (!selectedCell || !gameState) return;
        const { r, c } = selectedCell;
        if (gameState.puzzle[r][c] !== 0) return; // Can't change fixed cells

        const newBoard = board.map((row, rowIndex) => 
            row.map((cell, colIndex) => (rowIndex === r && colIndex === c ? num : cell))
        );
        setBoard(newBoard);

        // Check for win
        if (JSON.stringify(newBoard) === JSON.stringify(gameState.solution)) {
            Alert.alert("Harmony Achieved", "You've balanced the numbers perfectly.");
        }
    };

    if (!gameState) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </Pressable>
                <Text style={styles.title}>Soft Sudoku</Text>
                <Pressable style={styles.iconButton} onPress={startNewGame}>
                    <RotateCcw size={24} color={COLORS.text} />
                </Pressable>
            </View>
            
            <Text style={styles.subtitle}>Fill the grid so each row, column, and 2x2 block contains 1-4.</Text>

            <View style={styles.board}>
                {board.map((row, r) => (
                    <View key={r} style={styles.row}>
                        {row.map((cell, c) => (
                            <Pressable
                                key={c}
                                style={[
                                    styles.cell,
                                    selectedCell?.r === r && selectedCell?.c === c && styles.selectedCell,
                                    gameState.puzzle[r][c] !== 0 && styles.fixedCell
                                ]}
                                onPress={() => setSelectedCell({ r, c })}
                            >
                                <Text style={[styles.cellText, gameState.puzzle[r][c] !== 0 && styles.fixedText]}>
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
    container: { flex: 1, backgroundColor: COLORS.background, padding: 24, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: 15, color: COLORS.text, opacity: 0.7, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
    board: { alignSelf: 'center', backgroundColor: COLORS.border, padding: 4, borderRadius: 16, gap: 4 },
    row: { flexDirection: 'row', gap: 4 },
    cell: { width: 70, height: 70, backgroundColor: COLORS.cell, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    selectedCell: { backgroundColor: COLORS.selected, borderWidth: 2, borderColor: COLORS.accent },
    fixedCell: { backgroundColor: COLORS.fixed },
    cellText: { fontSize: 28, color: COLORS.accent, fontWeight: '600' },
    fixedText: { color: COLORS.text },
    numpad: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 50 },
    numBtn: { width: 56, height: 56, backgroundColor: COLORS.accent, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    numBtnText: { color: '#FFF', fontSize: 22, fontWeight: '700' },
});