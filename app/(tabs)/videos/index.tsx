import { useAuth } from '@/contexts/AuthContext';
import { useVideos } from '@/store/videos';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function VideosListScreen() {
  const { videos, refresh } = useVideos();
  const { user } = useAuth();
  const router = useRouter();
  const onRefresh = useCallback(() => { refresh().catch(() => {}); }, [refresh]);

  if (!user) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.titleLoggedOut}>Faça login para gerenciar vídeos</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Ir para Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
  keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum vídeo ainda</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => router.push({ pathname: '/video/[id]', params: { id: String(item.id) } } as any)}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B0B26' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  item: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600', color: '#fff' },
  empty: { textAlign: 'center', marginTop: 32, color: '#ddd' },
  titleLoggedOut: { fontSize: 18, color: '#fff', marginBottom: 16, textAlign: 'center' },
  loginButton: { backgroundColor: '#2ECC71', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  loginButtonText: { color: '#ffffff', fontWeight: '600' },
});
