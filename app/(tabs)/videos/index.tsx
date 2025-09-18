import { useAuth } from '@/contexts/AuthContext';
import { useVideos } from '@/store/videos';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';

function formatExpiry(expiresIn?: string) {
  if (!expiresIn) return null;
  const d = new Date(expiresIn);
  if (isNaN(d.getTime())) return null;
  // Ex: 18/09/2025 14:30
  const date = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

export default function VideosListScreen() {
  const { videos, refresh } = useVideos();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh().catch(() => {}).finally(() => setRefreshing(false));
  }, [refresh]);

  const contentPadding = useMemo(() => ({ paddingHorizontal: 16, paddingVertical: 16 }), []);

  if (!user) {
    return (
      <View style={[styles.container, styles.center]}>
        <MaterialIcons name="lock" color="#C5B3D9" size={48} style={{ marginBottom: 12 }} />
        <Text style={styles.titleLoggedOut}>Faça login para gerenciar vídeos</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
          <MaterialIcons name="login" size={18} color="#101010" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Ir para Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={videos.length === 0 ? undefined : contentPadding}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5B3D9" />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={[styles.center, { padding: 24 }]}>
            <MaterialIcons name="video-library" color="#C5B3D9" size={56} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Nenhum vídeo ainda</Text>
            <Text style={styles.emptySubtitle}>Envie seu primeiro vídeo para aparecer aqui</Text>
            <Pressable style={[styles.primaryButton, { marginTop: 16 }]} onPress={() => router.push('/(tabs)/upload')}>
              <MaterialIcons name="file-upload" size={18} color="#101010" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Enviar vídeo</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const expiry = formatExpiry(item.expiresIn);
          const onOpen = () => router.push({ pathname: '/video/[id]', params: { id: String(item.id) } } as any);
          const onShare = async () => {
            if (!item.shareUrl) return;
            try {
              await Share.share({ message: item.shareUrl, url: item.shareUrl });
            } catch {
              // ignore share errors
            }
          };
          return (
            <Pressable onPress={onOpen} style={styles.card} android_ripple={{ color: 'rgba(255,255,255,0.06)' }}>
              <View style={styles.row}>
                <View style={styles.thumb}>
                  <MaterialIcons name="movie" size={22} color="#E6DAF2" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                  {expiry ? (
                    <Text style={styles.meta} numberOfLines={1}>Expira em {expiry}</Text>
                  ) : null}
                </View>
                <View style={styles.actions}>
                  <Pressable disabled={!item.shareUrl} onPress={onShare} style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed, !item.shareUrl && styles.iconBtnDisabled]} hitSlop={8}>
                    <MaterialIcons name="share" size={20} color={item.shareUrl ? '#C5B3D9' : '#6D5A80'} />
                  </Pressable>
                  <MaterialIcons name="chevron-right" size={22} color="#C5B3D9" />
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B0B26' },
  center: { alignItems: 'center', justifyContent: 'center' },

  // Cards
  card: {
    backgroundColor: '#241034',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#3A1D4A',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#331848',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  meta: { marginTop: 4, fontSize: 12, color: '#C5B3D9' },
  actions: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  iconBtn: { padding: 6, borderRadius: 8, marginRight: 2 },
  iconBtnPressed: { backgroundColor: 'rgba(255,255,255,0.06)' },
  iconBtnDisabled: { opacity: 0.6 },

  // Empty state and auth CTA
  emptyTitle: { fontSize: 16, color: '#E6DAF2', fontWeight: '700' },
  emptySubtitle: { fontSize: 13, color: '#C5B3D9', marginTop: 4, textAlign: 'center' },
  titleLoggedOut: { fontSize: 18, color: '#fff', marginBottom: 8, textAlign: 'center', fontWeight: '700' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8CF2A6', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  primaryButtonText: { color: '#101010', fontWeight: '700' },
});
