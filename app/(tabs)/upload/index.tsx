import { useAuth } from '@/contexts/AuthContext';
import { useVideos } from '@/store/videos';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function UploadVideoScreen() {
  const { addVideo } = useVideos();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickVideo = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'video/*', multiple: false });
    if (res.canceled) return;
    setFile(res.assets[0]);
  };

  const onSubmit = async () => {
    if (!file) return Alert.alert('Selecione um vídeo');
    if (!title) return Alert.alert('Informe um título');
    setLoading(true);
    try {
      await addVideo(title, file.uri, user?.name);
      setTitle('');
      setFile(null);
      Alert.alert('Sucesso', 'Vídeo enviado!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enviar Vídeo</Text>
  <TextInput placeholder="Título" placeholderTextColor="#BFBFBF" value={title} onChangeText={setTitle} style={styles.input} />
      <Pressable onPress={pickVideo} style={[styles.button, styles.secondary]}>
        <Text style={styles.buttonText}>{file ? 'Vídeo selecionado' : 'Selecionar Vídeo'}</Text>
      </Pressable>
      <Pressable onPress={onSubmit} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#1B0B26' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, color: '#fff' },
  input: { borderWidth: 1, borderColor: '#444', color: '#fff', borderRadius: 8, padding: 12 },
  button: { backgroundColor: '#2ECC71', padding: 12, borderRadius: 8, alignItems: 'center' },
  secondary: { backgroundColor: '#2ECC71' },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});
