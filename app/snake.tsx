import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react-native';

const GRID_SIZE = 15;
const CELL_SIZE = 20;

const COLORS = {
  background: '#F0F4F8',
  board: '#E0EBE8',  // Very soft mint
  snakeHead: '#6B9080', // Darker sage
  snakeBody: '#A4C3B2', // Lighter sage
  food: '#E5989B', // Soft muted pink/red
  text: '#4A6FA5',
  button: '#FFFFFF',
};

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const INITIAL_SNAKE = [{ x: 7, y: 7 }, { x: 7, y: 8 }];
const INITIAL_DIRECTION: Direction = 'UP';

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const directionRef = useRef<Direction>(INITIAL_DIRECTION);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const generateFood = (currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment: Point) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    setFood(newFood);
  };

  useEffect(() => {
    if (isGameOver || isLoading) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        const newHead = { ...head };

        if (currentDir === 'UP') newHead.y -= 1;
        if (currentDir === 'DOWN') newHead.y += 1;
        if (currentDir === 'LEFT') newHead.x -= 1;
        if (currentDir === 'RIGHT') newHead.x += 1;

        // Check Wall Collision
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some((segment: Point) => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          generateFood(newSnake);
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, 250); // Relaxed pace
    return () => clearInterval(intervalId);
  }, [isGameOver, isLoading, food]);

  const handleControl = (newDir: Direction) => {
    const currentDir = directionRef.current;
    if (
      (newDir === 'UP' && currentDir === 'DOWN') ||
      (newDir === 'DOWN' && currentDir === 'UP') ||
      (newDir === 'LEFT' && currentDir === 'RIGHT') ||
      (newDir === 'RIGHT' && currentDir === 'LEFT')
    ) {
      return;
    }
    directionRef.current = newDir;
    setDirection(newDir);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    generateFood(INITIAL_SNAKE);
  };

  if (isLoading) return <LoadingScreen message="Preparing the garden" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        {isGameOver && <Text style={styles.gameOverText}>Game Over</Text>}
      </View>

      <View style={styles.boardContainer}>
        {/* Render Food */}
        <View
          style={[
            styles.food,
            { left: food.x * CELL_SIZE, top: food.y * CELL_SIZE },
          ]}
        />
        {/* Render Snake */}
        {snake.map((segment, index) => (
          <View
            key={`${segment.x}-${segment.y}-${index}`}
            style={[
              index === 0 ? styles.snakeHead : styles.snakeBody,
              { left: segment.x * CELL_SIZE, top: segment.y * CELL_SIZE },
            ]}
          />
        ))}
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Pressable style={styles.btn} onPress={() => handleControl('UP')}>
            <ChevronUp size={32} color={COLORS.text} />
          </Pressable>
        </View>
        <View style={styles.controlRow}>
          <Pressable style={styles.btn} onPress={() => handleControl('LEFT')}>
            <ChevronLeft size={32} color={COLORS.text} />
          </Pressable>
          <Pressable style={styles.btnRestart} onPress={resetGame}>
            <RotateCcw size={24} color={COLORS.text} />
          </Pressable>
          <Pressable style={styles.btn} onPress={() => handleControl('RIGHT')}>
            <ChevronRight size={32} color={COLORS.text} />
          </Pressable>
        </View>
        <View style={styles.controlRow}>
          <Pressable style={styles.btn} onPress={() => handleControl('DOWN')}>
            <ChevronDown size={32} color={COLORS.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    height: 60,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 1,
  },
  gameOverText: {
    fontSize: 18,
    color: COLORS.food,
    fontWeight: '500',
    marginTop: 8,
  },
  boardContainer: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    backgroundColor: COLORS.board,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  snakeHead: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: COLORS.snakeHead,
    position: 'absolute',
    borderRadius: 6,
  },
  snakeBody: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: COLORS.snakeBody,
    position: 'absolute',
    borderRadius: 4,
    transform: [{ scale: 0.9 }],
  },
  food: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: COLORS.food,
    position: 'absolute',
    borderRadius: CELL_SIZE / 2,
    transform: [{ scale: 0.8 }],
  },
  controls: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    backgroundColor: COLORS.button,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnRestart: {
    backgroundColor: COLORS.board,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
