import { useVideos } from '@/store/videos';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function UploadVideoScreen() {
  const { upload } = useVideos();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'preparing' | 'requesting' | 'uploading' | 'registering' | 'refreshing' | 'done' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pickVideo = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'video/*', multiple: false });
    if (res.canceled) return;
    setFile(res.assets[0]);
  };

  const onSubmit = async () => {
    // Inline validation feedback instead of Alert
    if (!file) {
      setFeedback('Selecione um vídeo');
      return;
    }
    if (!title) {
      setFeedback('Informe um título');
      return;
    }
    setFeedback(null);
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
      setFeedback('Vídeo enviado com sucesso!');
      router.replace('/(tabs)/videos');
    } catch (e:any) {
      const msg = e?.message || 'Falha ao enviar o vídeo. Tente novamente mais tarde.';
      setFeedback(msg);
    } finally {
      setLoading(false);
    }
  };

  const fileLabel = useMemo(() => {
    if (!file) return 'Selecionar Vídeo';
    if (file.name) return file.name;
    // fallback: extract basename from URI
    try {
      const parts = file.uri.split(/[\\/]/);
      return parts[parts.length - 1] || 'Vídeo selecionado';
    } catch {
      return 'Vídeo selecionado';
    }
  }, [file]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enviar Vídeo</Text>
      <TextInput
        placeholder="Título"
        placeholderTextColor="#BFBFBF"
        value={title}
        onChangeText={setTitle}
        style={[styles.input, loading && styles.disabledInput]}
        editable={!loading}
      />
      {feedback ? (
        <Text style={[styles.feedback, feedback.includes('sucesso') ? styles.feedbackSuccess : styles.feedbackError]}>
          {feedback}
        </Text>
      ) : null}
      <Pressable onPress={pickVideo} style={[styles.button, styles.secondary, loading && styles.disabled]} disabled={loading}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.buttonText}>{fileLabel}</Text>
      </Pressable>
      <Pressable onPress={onSubmit} style={[styles.button, loading && styles.disabled]} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar'}</Text>
      </Pressable>
      {loading ? (
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.overlayCard}>
            <ActivityIndicator color="#2ECC71" size="large" />
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
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
  // Darker green for the secondary (Select Video) button
  secondary: { backgroundColor: '#094622ff' },
  disabled: { opacity: 0.6 },
  disabledInput: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontWeight: '600' },
  progressContainer: { height: 16, backgroundColor: '#333', borderRadius: 8, overflow: 'hidden', marginTop: 8, alignSelf: 'stretch' },
  progressBar: { height: '100%', backgroundColor: '#2ECC71' },
  progressLabel: { color: '#fff', marginTop: 4, textAlign: 'center' },
  stageLabel: { color: '#BFBFBF', marginTop: 4, textAlign: 'center' },
  overlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  overlayCard: { backgroundColor: '#1E1A21', padding: 16, borderRadius: 12, width: '100%', maxWidth: 420, alignItems: 'center' },
  feedback: { marginTop: 4, marginBottom: 4, textAlign: 'left' as const },
  feedbackSuccess: { color: '#2ECC71' },
  feedbackError: { color: '#FF6B6B' },
});
