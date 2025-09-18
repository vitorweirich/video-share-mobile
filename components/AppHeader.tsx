import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AppHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Share</Text>
      {user ? (
        <View style={styles.right}>
          <View style={styles.userPill} accessibilityRole="text">
            <Text style={styles.buttonText}>{user.name}</Text>
          </View>
          <Pressable
            onPress={() => {
              Alert.alert('Sair', 'Deseja realmente sair?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: () => void logout() },
              ]);
            }}
            style={styles.logoutButton}
            accessibilityRole="button"
          >
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => router.push({ pathname: '/login' as any })}
          style={styles.button}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      )}
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
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  userPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2D2828',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#C0392B',
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
