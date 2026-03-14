import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Wind } from 'lucide-react-native';

const COLORS = {
  background: '#FDFBF7',
  text: '#5B6963',
  accent: '#A3B8B0',
};

export default function BreathingCircle() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();
    return () => breathingAnimation.stop();
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={COLORS.text} />
      </Pressable>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Wind size={40} color="#FFF" />
        </Animated.View>
        <Text style={styles.title}>Breathing Circle</Text>
        <Text style={styles.subtitle}>Inhale as the circle grows, exhale as it shrinks.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, paddingTop: 60 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#8B9C96', textAlign: 'center', lineHeight: 24, opacity: 0.8 },
});