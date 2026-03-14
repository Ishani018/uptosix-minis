import { Slot } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <View style={styles.mobileContainer}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // On web, the background outside the phone frame is slightly darker. 
    // On a real phone, the background is the soft cream app color.
    backgroundColor: Platform.OS === 'web' ? '#EAEAEA' : '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FDFBF7', // The main calming background of the app
    ...Platform.select({
      web: {
        maxWidth: 414, // Standard iPhone Max width
        maxHeight: 896, // Standard iPhone Max height
        borderRadius: 40, // Phone curve
        borderWidth: 12, // Fake phone bezel
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        marginVertical: 20, // Breathing room top and bottom
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      default: {
        // Normal behavior for actual iOS/Android devices
        maxWidth: '100%',
        maxHeight: '100%',
      }
    }),
  },
});