import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import { useGameDimensions } from './hooks/useGameDimensions';

type Point = { x: number; y: number };
const GRID_SIZE = 20;

export default function SnakeGarden() {
  const router = useRouter();
  const { boardSize } = useGameDimensions(24);
  const cellSize = boardSize / GRID_SIZE;

  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Point>({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  const handleSwipe = useCallback((dx: number, dy: number) => {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && dir.x === 0) setDir({ x: 1, y: 0 });
      else if (dx < 0 && dir.x === 0) setDir({ x: -1, y: 0 });
    } else {
      if (dy > 0 && dir.y === 0) setDir({ x: 0, y: 1 });
      else if (dy < 0 && dir.y === 0) setDir({ x: 0, y: -1 });
    }
  }, [dir.x, dir.y]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        lastTouch.current = { x: locationX, y: locationY };
      },
      onPanResponderMove: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!lastTouch.current) {
          const { locationX, locationY } = e.nativeEvent;
          lastTouch.current = { x: locationX, y: locationY };
          return;
        }
        const dx = gestureState.dx;
        const dy = gestureState.dy;
        handleSwipe(dx, dy);
      },
      onPanResponderRelease: () => {
        lastTouch.current = null;
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const moveSnake = useCallback(() => {
    if (gameOver || (dir.x === 0 && dir.y === 0)) return;

    setSnake(prev => {
      const head = prev[0];
      const newHead = { x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE, y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE };

      if (prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setGameOver(true);
        return prev;
      }

      const newSnake = [newHead, ...prev];
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [dir, food, gameOver]);

  useEffect(() => {
    const id = setInterval(moveSnake, 200);
    return () => clearInterval(id);
  }, [moveSnake]);

  const init = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDir({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}><ArrowLeft size={22} color="#3D4A47" /></Pressable>
        <Text style={styles.title}>Snake Garden</Text>
        <Pressable style={styles.iconBtn} onPress={init}><RotateCcw size={22} color="#3D4A47" /></Pressable>
      </View>
      <View style={styles.stats}><Text style={styles.score}>Score: {score}</Text></View>

      <View style={[styles.board, { width: boardSize, height: boardSize }]} {...panResponder.panHandlers}>
        {snake.map((s, i) => (
          <View key={i} style={[styles.snake, { left: s.x * cellSize, top: s.y * cellSize, width: cellSize, height: cellSize }]} />
        ))}
        <View style={[styles.food, { left: food.x * cellSize, top: food.y * cellSize, width: cellSize, height: cellSize }]} />
        {gameOver && <View style={styles.overlay}><Text style={styles.overlayText}>Game Over</Text><Pressable onPress={init} style={styles.resetBtn}><Text style={styles.resetText}>Try Again</Text></Pressable></View>}
      </View>

      <View style={styles.controlsHint}>
        <Text style={styles.hintText}>Swipe on the garden to move the snake.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#3D4A47' },
  stats: { marginBottom: 10 },
  score: { fontSize: 16, color: '#6B9080', fontWeight: '600' },
  board: { backgroundColor: '#EDE7D9', position: 'relative', borderRadius: 8, overflow: 'hidden' },
  snake: { position: 'absolute', backgroundColor: '#6B9080', borderRadius: 2 },
  food: { position: 'absolute', backgroundColor: '#C0605A', borderRadius: 10 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  overlayText: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 10 },
  resetBtn: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  resetText: { color: '#3D4A47', fontWeight: '600' },
  controlsHint: { marginTop: 20 },
  hintText: { fontSize: 12, color: '#9AACA6' },
});
