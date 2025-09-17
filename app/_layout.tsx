import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/AppHeader';
import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { VideosProvider } from '@/store/videos';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <VideosProvider>
          <SafeAreaView edges={['top']}>
            <AppHeader />
          </SafeAreaView>
          <View style={{ flex: 1, backgroundColor: '#1B0B26' }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="video/[id]" options={{ title: 'Vídeo' }} />
              <Stack.Screen name="login" options={{ title: 'Login' }} />
              <Stack.Screen name="cadastro" options={{ title: 'Cadastro' }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </View>
          <StatusBar style="auto" />
        </VideosProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
