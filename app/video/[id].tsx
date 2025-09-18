import { useVideos } from '@/store/videos';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function VideoViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, getPlaybackUrl } = useVideos();
  const item = useMemo(() => (id ? getById(Number(id)) : undefined), [id, getById]);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const url = await getPlaybackUrl(Number(id));
        if (mounted) setPlayUrl(url);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [getPlaybackUrl, id]);

  if (!item) return (
    <View style={styles.center}> 
      <Text>Vídeo não encontrado.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      {loading && <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />}
      {playUrl ? (
        <Video
          source={{ uri: playUrl }}
          style={styles.player}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: { color: '#fff', fontSize: 18, fontWeight: '600', padding: 12 },
  player: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
