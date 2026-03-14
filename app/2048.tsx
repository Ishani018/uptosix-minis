import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated, PanResponder, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react-native';
import { useGameDimensions } from './hooks/useGameDimensions';
import { AdEventType } from 'react-native-google-mobile-ads';
import { interstitialAd } from './hooks/ads';

// CANVA ASSET CONFIG
const ASSETS = {
    boardBackground: null as null | { uri: string },
    tileImages: {
        2: null, 4: null, 8: null, 16: null, 32: null,
        64: null, 128: null, 256: null, 512: null, 1024: null, 2048: null,
    } as Record<number, null | { uri: string }>,
};

const GRID_SIZE = 4;
const GAP = 8;
const APP_BG = '#FDFBF7';
const BOARD_BG = '#C8BFB0';
const TEXT_DARK = '#3D4A47';
const TEXT_LIGHT = '#9AACA6';

type TileConfig = { bg: string; text: string; fontSize: number };
const TILE_CFG: Record<number, TileConfig> = {
    0: { bg: 'rgba(238,228,214,0.8)', text: 'transparent', fontSize: 28 },
    2: { bg: '#EEE8DF', text: '#6B7E79', fontSize: 28 },
    4: { bg: '#EDE0C8', text: '#6B7E79', fontSize: 28 },
    8: { bg: '#F2A96A', text: '#FFFFFF', fontSize: 28 },
    16: { bg: '#E87E5A', text: '#FFFFFF', fontSize: 26 },
    32: { bg: '#E85D4A', text: '#FFFFFF', fontSize: 26 },
    64: { bg: '#D44730', text: '#FFFFFF', fontSize: 26 },
    128: { bg: '#DDB84A', text: '#FFFFFF', fontSize: 22 },
    256: { bg: '#D4A835', text: '#FFFFFF', fontSize: 22 },
    512: { bg: '#C89A1E', text: '#FFFFFF', fontSize: 20 },
    1024: { bg: '#7BBFA8', text: '#FFFFFF', fontSize: 16 },
    2048: { bg: '#4A9E86', text: '#FFFFFF', fontSize: 16 },
};
const getTileCfg = (v: number): TileConfig => TILE_CFG[v] ?? { bg: '#3D8C74', text: '#FFF', fontSize: 14 };

let _tid = 0;
type Tile = { id: number; value: number; row: number; col: number; isNew: boolean; isMerged: boolean };
const makeTile = (value: number, row: number, col: number, isNew = true): Tile =>
    ({ id: ++_tid, value, row, col, isNew, isMerged: false });

function addRandom(tiles: Tile[]): Tile[] {
    const occ = new Set(tiles.map(t => `${t.row},${t.col}`));
    const empty = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!occ.has(`${r},${c}`)) empty.push({ r, c });
    if (!empty.length) return tiles;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    return [...tiles, makeTile(Math.random() < 0.9 ? 2 : 4, r, c)];
}

function shiftLine(line: (Tile | null)[]): { out: (Tile | null)[]; score: number; moved: boolean } {
    const src = line.filter(Boolean) as Tile[];
    let score = 0; let moved = false; const merged: Tile[] = [];
    let i = 0;
    while (i < src.length) {
        if (i + 1 < src.length && src[i].value === src[i + 1].value) {
            const v = src[i].value * 2; score += v; moved = true;
            merged.push({ ...src[i], value: v, isMerged: true, isNew: false }); i += 2;
        } else { merged.push({ ...src[i], isMerged: false, isNew: false }); i++; }
    }
    return { out: [...merged, ...Array(4 - merged.length).fill(null)], score, moved };
}

type Dir = 'up' | 'down' | 'left' | 'right';
function doMove(tiles: Tile[], dir: Dir): { tiles: Tile[]; score: number; moved: boolean } {
    let totalScore = 0; let anyMoved = false; const out: Tile[] = [];
    const get = (r: number, c: number) => tiles.find(t => t.row === r && t.col === c) ?? null;
    if (dir === 'left' || dir === 'right') {
        for (let r = 0; r < 4; r++) {
            const line = [0, 1, 2, 3].map(c => get(r, c));
            const ord = dir === 'right' ? [...line].reverse() : line;
            const { out: res, score, moved } = shiftLine(ord);
            const fin = dir === 'right' ? [...res].reverse() : res;
            if (moved) anyMoved = true;
            fin.forEach((t, c) => { if (t) { if (t.col !== c || t.row !== r) anyMoved = true; out.push({ ...t, row: r, col: c }); } });
            totalScore += score;
        }
    } else {
        for (let c = 0; c < 4; c++) {
            const line = [0, 1, 2, 3].map(r => get(r, c));
            const ord = dir === 'down' ? [...line].reverse() : line;
            const { out: res, score, moved } = shiftLine(ord);
            const fin = dir === 'down' ? [...res].reverse() : res;
            if (moved) anyMoved = true;
            fin.forEach((t, r) => { if (t) { if (t.col !== c || t.row !== r) anyMoved = true; out.push({ ...t, row: r, col: c }); } });
            totalScore += score;
        }
    }
    return { tiles: out, score: totalScore, moved: anyMoved };
}

function hasMovesLeft(tiles: Tile[]): boolean {
    const g: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
    tiles.forEach(t => { g[t.row][t.col] = t.value; });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return true;
        if (r + 1 < 4 && g[r][c] === g[r + 1][c]) return true;
        if (c + 1 < 4 && g[r][c] === g[r][c + 1]) return true;
    }
    return false;
}

function TileView({ tile, cellSize }: { tile: Tile; cellSize: number }) {
    const scale = useRef(new Animated.Value(tile.isNew ? 0 : 1)).current;
    const prevVal = useRef(tile.value);
    useEffect(() => {
        if (tile.isNew) { scale.setValue(0); Animated.spring(scale, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start(); }
        else if (tile.isMerged && tile.value !== prevVal.current) {
            prevVal.current = tile.value;
            Animated.sequence([Animated.timing(scale, { toValue: 1.18, duration: 100, useNativeDriver: true }), Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true })]).start();
        }
    }, [tile.isNew, tile.isMerged, tile.value, scale]);
    const cfg = getTileCfg(tile.value);
    const left = tile.col * (cellSize + GAP) + GAP;
    const top = tile.row * (cellSize + GAP) + GAP;
    const assetImg = ASSETS.tileImages[tile.value];
    return (
        <Animated.View style={[styles.tile, { left, top, width: cellSize, height: cellSize, backgroundColor: cfg.bg, borderRadius: cellSize * 0.12, transform: [{ scale }] }]}>
            {assetImg
                ? <Image source={assetImg} style={{ width: cellSize, height: cellSize, borderRadius: cellSize * 0.12 }} resizeMode="cover" />
                : <Text style={[styles.tileText, { color: cfg.text, fontSize: cfg.fontSize * (cellSize / 80) }]} adjustsFontSizeToFit numberOfLines={1}>{tile.value}</Text>
            }
        </Animated.View>
    );
}

function ScorePop({ value }: { value: number | null }) {
    const ty = useRef(new Animated.Value(0)).current;
    const op = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (!value) return;
        ty.setValue(0); op.setValue(1);
        Animated.parallel([
            Animated.timing(ty, { toValue: -36, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.sequence([Animated.delay(300), Animated.timing(op, { toValue: 0, duration: 400, useNativeDriver: true })]),
        ]).start();
    }, [value, ty, op]);
    if (!value) return null;
    return <Animated.Text style={[styles.scorePop, { opacity: op, transform: [{ translateY: ty }] }]}>+{value}</Animated.Text>;
}

export default function Merge2048() {
    const router = useRouter();
    const { boardSize } = useGameDimensions(24);
    const cellSize = (boardSize - (GRID_SIZE + 1) * GAP) / GRID_SIZE;

    const [tiles, setTiles] = useState<Tile[]>([]);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [lastMerge, setLastMerge] = useState<number | null>(null);
    const [moveCount, setMoveCount] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [wonDismissed, setWonDismissed] = useState(false);
    const [adLoaded, setAdLoaded] = useState(false);

    const tilesRef = useRef<Tile[]>([]);
    const scoreRef = useRef(0);
    const doneRef = useRef(false);

    // ── Ad setup ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const unsubLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => setAdLoaded(true));
        const unsubClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            setAdLoaded(false);
            interstitialAd.load();
        });
        interstitialAd.load();
        return () => { unsubLoaded(); unsubClosed(); };
    }, []);
    // ─────────────────────────────────────────────────────────────────────────

    const initGame = useCallback(() => {
        _tid = 0;
        let t1 = makeTile(2, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
        let t2: Tile;
        do { t2 = makeTile(2, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)); }
        while (t2.row === t1.row && t2.col === t1.col);
        const initial = [t1, t2];
        tilesRef.current = initial; scoreRef.current = 0; doneRef.current = false;
        setTiles(initial); setScore(0); setMoveCount(0);
        setGameOver(false); setWon(false); setWonDismissed(false); setLastMerge(null);
    }, []);
    useEffect(() => { initGame(); }, [initGame]);

    // Show interstitial then start new game
    const handleTryAgain = () => {
        if (adLoaded) {
            interstitialAd.show();
            const unsub = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
                unsub();
                initGame();
            });
        } else {
            initGame();
        }
    };

    const handleBack = () => {
        if (adLoaded) {
            interstitialAd.show();
            const unsub = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
                unsub();
                if (router.canGoBack()) router.back(); else router.replace('/');
            });
        } else {
            if (router.canGoBack()) router.back(); else router.replace('/');
        }
    };

    const move = useCallback((dir: Dir) => {
        if (doneRef.current) return;
        const { tiles: next, score: gained, moved } = doMove(tilesRef.current, dir);
        if (!moved) return;
        const withNew = addRandom(next);
        tilesRef.current = withNew;
        scoreRef.current += gained;
        const ns = scoreRef.current;
        setTiles([...withNew]); setScore(ns); setMoveCount(m => m + 1);
        if (gained > 0) { setLastMerge(null); setTimeout(() => setLastMerge(gained), 10); }
        setBestScore(b => Math.max(b, ns));
        if (withNew.some(t => t.value === 2048)) setWon(true);
        if (!hasMovesLeft(withNew)) { doneRef.current = true; setGameOver(true); }
    }, []);

    const pan = useRef(PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
        onPanResponderRelease: (_, g) => {
            if (Math.abs(g.dx) > Math.abs(g.dy)) move(g.dx > 0 ? 'right' : 'left');
            else move(g.dy > 0 ? 'down' : 'up');
        },
    })).current;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.iconBtn} onPress={handleBack}><ArrowLeft size={22} color={TEXT_DARK} /></Pressable>
                <Text style={styles.title}>2048</Text>
                <Pressable style={styles.iconBtn} onPress={initGame}><RotateCcw size={22} color={TEXT_DARK} /></Pressable>
            </View>
            <View style={styles.scoreRow}>
                <View style={styles.scoreBadge}>
                    <Text style={styles.scoreLbl}>SCORE</Text>
                    <Text style={styles.scoreVal}>{score}</Text>
                    <ScorePop value={lastMerge} />
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: '#F5EDD4' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Trophy size={11} color={TEXT_LIGHT} /><Text style={styles.scoreLbl}>BEST</Text></View>
                    <Text style={[styles.scoreVal, { color: '#D4A843' }]}>{bestScore}</Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Text style={styles.scoreLbl}>MOVES</Text>
                    <Text style={styles.scoreVal}>{moveCount}</Text>
                </View>
            </View>

            <View style={[styles.board, { width: boardSize, height: boardSize, borderRadius: 16 }]} {...pan.panHandlers}>
                {ASSETS.boardBackground && <Image source={ASSETS.boardBackground} style={StyleSheet.absoluteFill} resizeMode="cover" />}
                {Array.from({ length: 16 }, (_, i) => {
                    const r = Math.floor(i / 4), c = i % 4;
                    return <View key={i} style={[styles.emptyCell, { left: c * (cellSize + GAP) + GAP, top: r * (cellSize + GAP) + GAP, width: cellSize, height: cellSize, borderRadius: cellSize * 0.12 }]} />;
                })}
                {tiles.map(t => <TileView key={t.id} tile={t} cellSize={cellSize} />)}
                {gameOver && (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayTitle}>Game Over</Text>
                        <Text style={styles.overlayScore}>{score}</Text>
                        {score >= bestScore && score > 0 && <Text style={styles.overlayBest}>✦ New Best ✦</Text>}
                        <Pressable style={styles.overlayBtn} onPress={handleTryAgain}>
                            <RotateCcw size={16} color={TEXT_DARK} />
                            <Text style={styles.overlayBtnTxt}>Try Again</Text>
                        </Pressable>
                    </View>
                )}
                {won && !wonDismissed && (
                    <View style={[styles.overlay, { backgroundColor: 'rgba(238,248,243,0.96)' }]}>
                        <Text style={[styles.overlayTitle, { fontSize: 52, color: '#4A9E86', letterSpacing: -1 }]}>2048!</Text>
                        <Text style={[styles.overlayScore, { fontSize: 16, color: TEXT_LIGHT }]}>You reached the tile ✦</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                            <Pressable style={styles.overlayBtn} onPress={() => setWonDismissed(true)}><Text style={styles.overlayBtnTxt}>Keep Going</Text></Pressable>
                            <Pressable style={[styles.overlayBtn, { backgroundColor: '#6B9080' }]} onPress={handleTryAgain}><RotateCcw size={16} color="#FFF" /><Text style={[styles.overlayBtnTxt, { color: '#FFF' }]}>New Game</Text></Pressable>
                        </View>
                    </View>
                )}
            </View>
            <Text style={styles.hint}>Swipe to merge · Reach 2048</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: APP_BG, padding: 24, paddingTop: 60, alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0EDE8', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 26, fontWeight: '800', color: TEXT_DARK, letterSpacing: -0.5 },
    scoreRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    scoreBadge: { backgroundColor: '#EDE7DC', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center', minWidth: 76, overflow: 'visible' },
    scoreLbl: { fontSize: 9, fontWeight: '700', color: TEXT_LIGHT, letterSpacing: 0.8 },
    scoreVal: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, lineHeight: 26 },
    scorePop: { position: 'absolute', top: -6, right: 6, fontSize: 13, fontWeight: '800', color: '#E87E5A' },
    board: { backgroundColor: BOARD_BG, position: 'relative', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
    emptyCell: { position: 'absolute', backgroundColor: 'rgba(238,228,214,0.5)' },
    tile: { position: 'absolute', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    tileText: { fontWeight: '800', letterSpacing: -0.5 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(253,251,247,0.94)', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 16 },
    overlayTitle: { fontSize: 28, fontWeight: '300', color: TEXT_DARK, letterSpacing: 2 },
    overlayScore: { fontSize: 48, fontWeight: '800', color: TEXT_DARK, lineHeight: 56 },
    overlayBest: { fontSize: 13, fontWeight: '600', color: '#D4A843', letterSpacing: 1 },
    overlayBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EDE7DC', paddingVertical: 11, paddingHorizontal: 20, borderRadius: 18, marginTop: 6 },
    overlayBtnTxt: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
    hint: { marginTop: 16, fontSize: 12, color: TEXT_LIGHT, letterSpacing: 0.3 },
});