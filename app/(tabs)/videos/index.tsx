import { useAuth } from '@/contexts/AuthContext';
import { useVideos } from '@/store/videos';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function VideosListScreen() {
  const { videos } = useVideos();
  const router = useRouter();
  const { user } = useAuth();

  const myVideos = user ? videos.filter(v => v.owner === user.name) : videos;

  return (
    <View style={styles.container}>
      <FlatList
        data={myVideos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum vídeo ainda</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => router.push({ pathname: '/video/[id]', params: { id: item.id } } as any)}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              {item.owner ? <Text style={styles.owner}>por {item.owner}</Text> : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B0B26' },
  item: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600', color: '#fff' },
  owner: { color: '#ddd', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 32, color: '#ddd' },
});
