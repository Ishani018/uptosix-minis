import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, Pencil, Undo2, Clock } from 'lucide-react-native';
import { useGameDimensions } from './hooks/useGameDimensions';

// CANVA ASSET CONFIG
const ASSETS = {
    background: null as null | { uri: string },
    boardOverlay: null as null | { uri: string },
    numpadBtnBg: null as null | { uri: string },
};

const COLORS = {
    background: '#F7F3EE', sand: '#EDE7D9', text: '#3D4A47', textLight: '#9AACA6',
    accent: '#6B9080', accentLight: '#A4C3B2', cell: '#FDFBF7', fixedCell: '#F2EDE6',
    selectedCell: '#DFF0EA', highlightCell: '#EEF7F3', sameRowCol: '#F5F1EA',
    errorCell: '#FDE8E8', errorText: '#C0605A', border: '#DDD5C8', thickBorder: '#6B9080',
    numpadBtn: '#FDFBF7', numpadComplete: '#C8DDD7', noteText: '#7A9E95', winBg: 'rgba(107,144,128,0.15)',
};

type Difficulty = 'easy' | 'medium' | 'hard';
type CellNotes = Set<number>;

const BASE = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9], [4, 5, 6, 7, 8, 9, 1, 2, 3], [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1], [5, 6, 7, 8, 9, 1, 2, 3, 4], [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2], [6, 7, 8, 9, 1, 2, 3, 4, 5], [9, 1, 2, 3, 4, 5, 6, 7, 8],
];

const shuffle = <T,>(a: T[]) => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
};

const transpose = (m: number[][]) => m[0].map((_, i) => m.map(r => r[i]));
const REMOVE: Record<Difficulty, number> = { easy: 36, medium: 46, hard: 54 };

function generateSudoku(diff: Difficulty) {
    const bo = shuffle([0, 1, 2]);
    let board: number[][] = [];
    for (const b of bo) {
        const rows = shuffle([b * 3, b * 3 + 1, b * 3 + 2]);
        for (const r of rows) board.push([...BASE[r]]);
    }
    board = transpose(board);
    const co = shuffle([0, 1, 2]);
    let final: number[][] = [];
    for (const b of co) {
        const cols = shuffle([b * 3, b * 3 + 1, b * 3 + 2]);
        for (const c of cols) final.push(board[c]);
    }
    final = transpose(final);
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const solution = final.map(row => row.map(v => digits[v - 1]));
    const puzzle = solution.map(row => [...row]);
    const pos = shuffle(Array.from({ length: 81 }, (_, i) => i));
    for (let i = 0; i < REMOVE[diff]; i++) puzzle[Math.floor(pos[i] / 9)][pos[i] % 9] = 0;
    return { puzzle, solution };
}

function useTimer(running: boolean) {
    const [s, setS] = useState(0);
    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => setS(x => x + 1), 1000);
        return () => clearInterval(id);
    }, [running]);
    const reset = () => setS(0);
    const fmt = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    return { fmt, reset };
}

export default function SoftSudoku() {
    const router = useRouter();
    const { sw } = useGameDimensions(24);
    const BOARD_SIZE = sw - 48;
    const CELL_SIZE = Math.floor(BOARD_SIZE / 9);
    const NUMPAD_BTN = Math.floor((sw - 48 - 8 * 6) / 9);

    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [gameState, setGameState] = useState<{ puzzle: number[][], solution: number[][] } | null>(null);
    const [board, setBoard] = useState<number[][]>([]);
    const [notes, setNotes] = useState<CellNotes[][]>([]);
    const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
    const [pencilMode, setPencilMode] = useState(false);
    const [history, setHistory] = useState<{ board: number[][], notes: CellNotes[][] }[]>([]);
    const [isWon, setIsWon] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const winAnim = useRef(new Animated.Value(0)).current;

    const { fmt: timerFmt, reset: resetTimer } = useTimer(!isWon && !!gameState);

    const startGame = (diff: Difficulty = difficulty) => {
        const { puzzle, solution } = generateSudoku(diff);
        setGameState({ puzzle, solution });
        setBoard(puzzle.map(r => [...r]));
        setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set())));
        setSelected(null); setHistory([]); setIsWon(false); setMistakes(0);
        resetTimer(); winAnim.setValue(0);
    };

    useEffect(() => { startGame(); }, []);

    const numCounts = Array.from({ length: 9 }, (_, i) => board.flat().filter(v => v === i + 1).length);

    const saveHistory = () => setHistory(h => [...h.slice(-19), { board: board.map(r => [...r]), notes: notes.map(row => row.map(s => new Set(s))) }]);

    const handleNumberPress = (num: number) => {
        if (!selected || !gameState) return;
        const { r, c } = selected;
        if (gameState.puzzle[r][c] !== 0) return;
        if (pencilMode) {
            saveHistory();
            const n = notes.map(row => row.map(s => new Set(s)));
            n[r][c].has(num) ? n[r][c].delete(num) : n[r][c].add(num);
            setNotes(n);
        } else {
            saveHistory();
            const nb = board.map(row => [...row]); nb[r][c] = num;
            const nn = notes.map(row => row.map(s => new Set(s))); nn[r][c].clear();
            for (let i = 0; i < 9; i++) { nn[r][i].delete(num); nn[i][c].delete(num); }
            const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
            for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) nn[br + dr][bc + dc].delete(num);
            setNotes(nn); setBoard(nb);
            if (num !== gameState.solution[r][c]) setMistakes(m => m + 1);
            if (nb.flat().every(v => v !== 0) && JSON.stringify(nb) === JSON.stringify(gameState.solution)) {
                setIsWon(true);
                Animated.spring(winAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
            }
        }
    };

    const handleErase = () => {
        if (!selected || !gameState) return;
        const { r, c } = selected;
        if (gameState.puzzle[r][c] !== 0) return;
        saveHistory();
        const nb = board.map(row => [...row]); nb[r][c] = 0;
        const nn = notes.map(row => row.map(s => new Set(s))); nn[r][c].clear();
        setBoard(nb); setNotes(nn);
    };

    const handleUndo = () => {
        if (!history.length) return;
        const p = history[history.length - 1];
        setBoard(p.board); setNotes(p.notes || []); setHistory(h => h.slice(0, -1));
    };

    const getCellBg = (r: number, c: number) => {
        if (!gameState) return COLORS.cell;
        const val = board[r][c];
        const isFixed = gameState.puzzle[r][c] !== 0;
        const isSel = selected?.r === r && selected?.c === c;
        const selVal = selected ? board[selected.r][selected.c] : 0;
        const isError = !isFixed && val !== 0 && val !== gameState.solution[r][c];
        if (isError) return COLORS.errorCell;
        if (isSel) return COLORS.selectedCell;
        if (val !== 0 && val === selVal && !isSel) return COLORS.highlightCell;
        if (selected) {
            const { r: sr, c: sc } = selected;
            const sameBox = Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3);
            if (r === sr || c === sc || sameBox) return COLORS.sameRowCol;
        }
        return isFixed ? COLORS.fixedCell : COLORS.cell;
    };

    if (!gameState) return null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: COLORS.background }]} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Pressable style={styles.iconBtn} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}><ArrowLeft size={22} color={COLORS.text} /></Pressable>
                <Text style={styles.title}>Soft Sudoku</Text>
                <Pressable style={styles.iconBtn} onPress={() => startGame()}><RotateCcw size={22} color={COLORS.text} /></Pressable>
            </View>

            <View style={styles.metaRow}>
                <View style={styles.diffRow}>
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                        <Pressable key={d} style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]} onPress={() => { setDifficulty(d); startGame(d); }}>
                            <Text style={[styles.diffTxt, difficulty === d && styles.diffTxtActive]}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
                        </Pressable>
                    ))}
                </View>
                <View style={styles.timerRow}><Clock size={12} color={COLORS.textLight} /><Text style={styles.timerTxt}>{timerFmt}</Text></View>
            </View>

            <View style={styles.statsRow}>
                <Text style={styles.statLbl}>Mistakes</Text>
                <View style={styles.dots}>{[0, 1, 2].map(i => <View key={i} style={[styles.dot, mistakes > i && styles.dotFilled]} />)}</View>
            </View>

            <View style={[styles.gridWrap, { width: BOARD_SIZE + 4 }]}>
                <View style={[styles.grid, { width: BOARD_SIZE }]}>
                    {board.map((row, r) => (
                        <View key={r} style={[styles.row, (r === 2 || r === 5) && styles.rowThick]}>
                            {row.map((cell, c) => {
                                const cNotes = notes[r][c];
                                const isFixed = gameState.puzzle[r][c] !== 0;
                                const isError = !isFixed && cell !== 0 && cell !== gameState.solution[r][c];
                                return (
                                    <Pressable
                                        key={c}
                                        style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: getCellBg(r, c) }, (c === 2 || c === 5) && styles.colThick]}
                                        onPress={() => setSelected({ r, c })}
                                    >
                                        {cell !== 0
                                            ? <Text style={[styles.cellTxt, { fontSize: CELL_SIZE * 0.46, color: isError ? COLORS.errorText : isFixed ? COLORS.text : COLORS.accent, fontWeight: isFixed ? '700' : '500' }]}>{cell}</Text>
                                            : cNotes && cNotes.size > 0 && <View style={styles.notesGrid}>{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <Text key={n} style={[styles.noteTxt, { fontSize: CELL_SIZE * 0.22, width: CELL_SIZE / 3 }]}>{cNotes.has(n) ? n : ' '}</Text>)}</View>
                                        }
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            {isWon && (
                <Animated.View style={[styles.winBanner, { opacity: winAnim, transform: [{ scale: winAnim }] }]}>
                    <Text style={styles.winTxt}>✦ Harmony Found ✦</Text>
                    <Text style={styles.winSub}>{timerFmt} · {mistakes} mistake{mistakes !== 1 ? 's' : ''}</Text>
                </Animated.View>
            )}

            <View style={styles.actionBar}>
                <Pressable style={styles.actionBtn} onPress={handleUndo}><Undo2 size={18} color={history.length > 0 ? COLORS.accent : COLORS.textLight} /><Text style={[styles.actionLbl, { color: history.length > 0 ? COLORS.accent : COLORS.textLight }]}>Undo</Text></Pressable>
                <Pressable style={styles.actionBtn} onPress={handleErase}><Text style={[styles.eraseTxt, { color: COLORS.accent }]}>⌫</Text><Text style={[styles.actionLbl, { color: COLORS.accent }]}>Erase</Text></Pressable>
                <Pressable style={[styles.actionBtn, pencilMode && { backgroundColor: COLORS.accent }]} onPress={() => setPencilMode(p => !p)}><Pencil size={18} color={pencilMode ? '#FFF' : COLORS.accent} /><Text style={[styles.actionLbl, { color: pencilMode ? '#FFF' : COLORS.accent }]}>Notes</Text></Pressable>
            </View>

            <View style={styles.numpad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                    const done = numCounts[num - 1] >= 9;
                    return (
                        <Pressable key={num} style={[styles.numBtn, { width: NUMPAD_BTN, height: NUMPAD_BTN * 1.15 }, done && styles.numBtnDone]} onPress={() => handleNumberPress(num)} disabled={done}>
                            <Text style={[styles.numBtnTxt, { fontSize: NUMPAD_BTN * 0.45, color: done ? COLORS.textLight : COLORS.accent }]}>{num}</Text>
                            {!done && <Text style={styles.numCount}>{9 - numCounts[num - 1]}</Text>}
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingTop: 60, paddingBottom: 40, alignItems: 'center', paddingHorizontal: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 14 },
    iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '700', color: '#3D4A47', letterSpacing: 0.3 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 },
    diffRow: { flexDirection: 'row', backgroundColor: '#EDE7D9', borderRadius: 14, padding: 3, gap: 3 },
    diffBtn: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 11 },
    diffBtnActive: { backgroundColor: '#6B9080' },
    diffTxt: { fontSize: 11, fontWeight: '600', color: '#3D4A47' },
    diffTxtActive: { color: '#FFF' },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timerTxt: { fontSize: 12, color: '#9AACA6', fontWeight: '500' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    statLbl: { fontSize: 11, color: '#9AACA6', fontWeight: '500' },
    dots: { flexDirection: 'row', gap: 5 },
    dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1.5, borderColor: '#C0605A' },
    dotFilled: { backgroundColor: '#C0605A' },
    gridWrap: { borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#6B9080', marginBottom: 14 },
    grid: { backgroundColor: '#DDD5C8' },
    row: { flexDirection: 'row' },
    rowThick: { borderBottomWidth: 2, borderBottomColor: '#6B9080' },
    cell: { justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#DDD5C8' },
    colThick: { borderRightWidth: 2, borderRightColor: '#6B9080' },
    cellTxt: { textAlign: 'center' },
    notesGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '100%', padding: 1 },
    noteTxt: { textAlign: 'center', color: '#7A9E95', fontWeight: '500' },
    winBanner: { backgroundColor: 'rgba(107,144,128,0.15)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#A4C3B2' },
    winTxt: { fontSize: 16, fontWeight: '700', color: '#6B9080', letterSpacing: 1 },
    winSub: { fontSize: 12, color: '#9AACA6', marginTop: 3 },
    actionBar: { flexDirection: 'row', gap: 8, marginBottom: 14, justifyContent: 'center' },
    actionBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDFBF7', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, gap: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
    actionLbl: { fontSize: 10, fontWeight: '600' },
    eraseTxt: { fontSize: 18, lineHeight: 20 },
    numpad: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
    numBtn: { backgroundColor: '#FDFBF7', borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
    numBtnDone: { backgroundColor: '#C8DDD7', opacity: 0.5 },
    numBtnTxt: { fontWeight: '700' },
    numCount: { fontSize: 8, color: '#9AACA6', fontWeight: '500', position: 'absolute', bottom: 3, right: 4 },
});
