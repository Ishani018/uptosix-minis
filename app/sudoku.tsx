import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 48 - 10) / 9); // Responsive size for 9x9

const COLORS = {
    background: '#FDFBF7',
    text: '#5B6963',
    accent: '#A3B8B0',
    cell: '#FFFFFF',
    fixed: '#F4F7F6',
    selected: '#EAF4F5',
    border: '#EAEAEA',
    thickBorder: '#5B6963',
};

// 9x9 Sudoku Generator (Template-based for stability/speed)
const generateSudoku = () => {
    const base = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8]
    ];

    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

    // Swap groups (blocks of 3 rows)
    const blockOrder = shuffle([0, 1, 2]);
    let shuffled = [];
    for (let b of blockOrder) {
        const rows = shuffle([b * 3, b * 3 + 1, b * 3 + 2]);
        for (let r of rows) shuffled.push(base[r]);
    }

    // Transpose to shuffle columns by same logic
    const transpose = (m: any[][]) => m[0].map((_, i) => m.map(row => row[i]));
    shuffled = transpose(shuffled);
    
    const colBlockOrder = shuffle([0, 1, 2]);
    let finalBoard: number[][] = [];
    for (let b of colBlockOrder) {
        const cols = shuffle([b * 3, b * 3 + 1, b * 3 + 2]);
        for (let c of cols) finalBoard.push(shuffled[c]);
    }
    finalBoard = transpose(finalBoard);

    // Remove numbers based on difficulty (mindful = easier, ~40 numbers shown)
    const puzzle = finalBoard.map(row => row.map(cell => Math.random() > 0.55 ? cell : 0));

    return { puzzle, solution: finalBoard };
};

export default function SoftSudoku() {
    const router = useRouter();
    const [gameState, setGameState] = useState<{ puzzle: number[][], solution: number[][] } | null>(null);
    const [board, setBoard] = useState<number[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);

    const startNewGame = () => {
        const { puzzle, solution } = generateSudoku();
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
        if (gameState.puzzle[r][c] !== 0) return;

        const newBoard = board.map((row, rIdx) => 
            row.map((cell, cIdx) => (rIdx === r && cIdx === c ? num : cell))
        );
        setBoard(newBoard);

        // Check if full board matches solution
        if (newBoard.flat().every(v => v !== 0) && JSON.stringify(newBoard) === JSON.stringify(gameState.solution)) {
            Alert.alert("Harmony Found", "The grid is perfectly balanced.");
        }
    };

    if (!gameState) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </Pressable>
                <Text style={styles.title}>Soft Sudoku</Text>
                <Pressable style={styles.iconButton} onPress={startNewGame}>
                    <RotateCcw size={24} color={COLORS.text} />
                </Pressable>
            </View>

            <Text style={styles.subtitle}>A full 9x9 grid for deep, focused harmony.</Text>

            <View style={styles.gridContainer}>
                {board.map((row, r) => (
                    <View key={r} style={[styles.row, r % 3 === 2 && r !== 8 && styles.rowBlock]}>
                        {row.map((cell, c) => (
                            <Pressable
                                key={c}
                                style={[
                                    styles.cell,
                                    { width: CELL_SIZE, height: CELL_SIZE },
                                    selectedCell?.r === r && selectedCell?.c === c && styles.selectedCell,
                                    gameState.puzzle[r][c] !== 0 && styles.fixedCell,
                                    c % 3 === 2 && c !== 8 && styles.colBlock
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
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <Pressable 
                        key={num} 
                        style={[styles.numBtn, { width: CELL_SIZE * 1.2, height: CELL_SIZE * 1.2 }]} 
                        onPress={() => handleNumberPress(num)}
                    >
                        <Text style={styles.numBtnText}>{num}</Text>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 24, paddingTop: 60, alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 },
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: 14, color: COLORS.text, opacity: 0.7, textAlign: 'center', marginBottom: 30 },
    gridContainer: { 
        backgroundColor: COLORS.border, 
        padding: 1, 
        borderRadius: 8, 
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.text,
    },
    row: { flexDirection: 'row' },
    rowBlock: { borderBottomWidth: 2, borderBottomColor: COLORS.text },
    colBlock: { borderRightWidth: 2, borderRightColor: COLORS.text },
    cell: { 
        backgroundColor: COLORS.cell, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    selectedCell: { backgroundColor: COLORS.selected },
    fixedCell: { backgroundColor: COLORS.fixed },
    cellText: { fontSize: 18, color: COLORS.accent, fontWeight: '600' },
    fixedText: { color: COLORS.text },
    numpad: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: 10, 
        marginTop: 30,
        paddingHorizontal: 10 
    },
    numBtn: { 
        backgroundColor: COLORS.accent, 
        borderRadius: 8, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2 
    },
    numBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});