import { useVideos } from '@/store/videos';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function UploadVideoScreen() {
  const { upload } = useVideos();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'preparing' | 'requesting' | 'uploading' | 'registering' | 'refreshing' | 'done' | null>(null);

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
      const name = title || file.name || 'video.mp4';
      const size = typeof file.size === 'number' ? file.size : 0;
      const mime = file.mimeType || 'video/mp4';
      setProgress(0);
      await upload(
        { uri: file.uri, name, size, mimeType: mime },
        (p) => setProgress(p),
        (s) => setStage(s),
      );
      setTitle('');
      setFile(null);
      setProgress(0);
      setStage(null);
      Alert.alert('Sucesso', 'Vídeo enviado com sucesso!');
      router.replace('/(tabs)/videos');
    } catch (e:any) {
      const msg = e?.message || 'Falha ao enviar o vídeo. Tente novamente mais tarde.';
      Alert.alert('Erro no upload', msg);
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
      {loading ? (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
          <Text style={styles.progressLabel}>{Math.round(progress * 100)}%</Text>
          {stage && (
            <Text style={styles.stageLabel}>
              {stage === 'preparing' && 'Preparando arquivo...'}
              {stage === 'requesting' && 'Solicitando URL de upload...'}
              {stage === 'uploading' && 'Enviando vídeo...'}
              {stage === 'registering' && 'Finalizando upload...'}
              {stage === 'refreshing' && 'Atualizando lista de vídeos...'}
              {stage === 'done' && 'Concluído!'}
            </Text>
          )}
        </View>
      ) : null}
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
  progressContainer: { height: 16, backgroundColor: '#333', borderRadius: 8, overflow: 'hidden', marginTop: 8 },
  progressBar: { height: '100%', backgroundColor: '#2ECC71' },
  progressLabel: { color: '#fff', marginTop: 4, textAlign: 'center' },
  stageLabel: { color: '#BFBFBF', marginTop: 4, textAlign: 'center' },
});
