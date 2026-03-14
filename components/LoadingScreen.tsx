import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import React, { useEffect, useState } from 'react';

const COLORS = {
  background: '#F0F4F8', // soft blue/gray
  primary: '#6B9080', // muted sage green
  text: '#A4C3B2', // lighter sage
};

export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message}{dots}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
