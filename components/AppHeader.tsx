import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AppHeader() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Share</Text>
      <Pressable
        onPress={() => {
          if (user) return; // could navigate to profile later
          router.push({ pathname: '/login' as any });
        }}
        style={styles.button}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{user ? user.name : 'Login'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E1A21',
    backgroundColor: '#1E1A21',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2ECC71',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2D2828',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
