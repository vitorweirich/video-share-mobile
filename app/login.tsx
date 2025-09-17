import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name) return Alert.alert('Informe seu nome');
    setLoading(true);
    try {
      await login(name, password);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
  <TextInput placeholder="Nome" placeholderTextColor="#BFBFBF" value={name} onChangeText={setName} style={styles.input} />
  <TextInput placeholder="Senha" placeholderTextColor="#BFBFBF" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Pressable onPress={onSubmit} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </Pressable>
  <Link href={{ pathname: '/cadastro' } as any} style={styles.link}>Não tem conta? Cadastre-se</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#1B0B26' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, color: '#fff' },
  input: { borderWidth: 1, borderColor: '#444', color: '#fff', borderRadius: 8, padding: 12 },
  button: { backgroundColor: '#2ECC71', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '600' },
  link: { color: '#BFBFBF', marginTop: 8 },
});
