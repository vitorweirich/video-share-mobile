import { useVideos } from '@/store/videos';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function VideoViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = useVideos();
  const item = useMemo(() => (id ? getById(String(id)) : undefined), [id, getById]);

  if (!item) return (
    <View style={styles.center}> 
      <Text>Vídeo não encontrado.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Video
        source={{ uri: item.uri }}
        style={styles.player}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: { color: '#fff', fontSize: 18, fontWeight: '600', padding: 12 },
  player: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
