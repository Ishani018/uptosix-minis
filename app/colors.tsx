import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Droplet } from 'lucide-react-native';

export default function ColorSort() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#5B6963" />
            </Pressable>
            <View style={styles.center}>
                <Droplet size={64} color="#A3B8B0" style={{ marginBottom: 20 }} />
                <Text style={styles.title}>Color Sort</Text>
                <Text style={styles.subtitle}>Harmonious gradient sorting is on the way.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7', padding: 24, paddingTop: 60 },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    title: { fontSize: 28, fontWeight: '700', color: '#5B6963', marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#8B9C96', textAlign: 'center', lineHeight: 24 },
});