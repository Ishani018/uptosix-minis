import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Waves } from 'lucide-react-native';

const COLORS = {
  water: '#EAF4F5',
   lily: '#A3B8B0',
  text: '#5B6963',
  background: '#FDFBF7',
};

export default function ZenPond() {
  const router = useRouter();
  const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);

  const addRipple = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const id = Date.now();
    setRipples(prev => [...prev, { x: locationX, y: locationY, id }]);
    
    // Auto-remove ripple after animation
    setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Zen Pond</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <Text style={styles.subtitle}>Tap the water to create ripples. Watch the light dance.</Text>

      <Pressable style={styles.pond} onPress={addRipple}>
        {ripples.map(r => (
           <Ripple key={r.id} x={r.x} y={r.y} />
        ))}
        {/* Static Lily Pads */}
        <View style={[styles.lily, { top: '20%', left: '30%', transform: [{ scale: 1.2 }] }]} />
        <View style={[styles.lily, { top: '60%', left: '70%' }]} />
        <View style={[styles.lily, { top: '75%', left: '15%', transform: [{ scale: 0.8 }] }]} />
      </Pressable>
    </View>
  );
}

function Ripple({ x, y }: { x: number, y: number }) {
    const scale = React.useRef(new Animated.Value(0)).current;
    const opacity = React.useRef(new Animated.Value(0.6)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(scale, { toValue: 4, duration: 2000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View 
            style={[
                styles.ripple, 
                { 
                    left: x - 25, 
                    top: y - 25, 
                    transform: [{ scale }], 
                    opacity 
                }
            ]} 
        />
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.text, opacity: 0.7, textAlign: 'center', marginBottom: 40 },
  pond: {
    flex: 1,
    backgroundColor: COLORS.water,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#D0E5E8',
    overflow: 'hidden',
  },
  lily: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lily,
    opacity: 0.6,
  },
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
