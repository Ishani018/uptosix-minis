import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function RootLayout() {
  console.log('Simplified Layout Rendering');
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
