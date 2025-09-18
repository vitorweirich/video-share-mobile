import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CadastroScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name) return Alert.alert('Informe seu nome');
    if (!email) return Alert.alert('Informe seu e-mail');
    setLoading(true);
    try {
      await register(name, email, password);
      Alert.alert(
        'Cadastro quase lá',
        'Enviamos um e-mail de confirmação. Confirme para concluir seu cadastro.',
        [
          {
            text: 'OK',
            onPress: () => router.replace({ pathname: '/login' } as any),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <TextInput placeholder="Nome" placeholderTextColor="#BFBFBF" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#BFBFBF"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput placeholder="Senha" placeholderTextColor="#BFBFBF" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Pressable onPress={onSubmit} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#1B0B26' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, color: '#fff' },
  input: { borderWidth: 1, borderColor: '#444', color: '#fff', borderRadius: 8, padding: 12 },
  button: { backgroundColor: '#2ECC71', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});
