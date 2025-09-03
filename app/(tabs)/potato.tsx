import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { setPreferredColorScheme, subscribePreferredColorScheme, useColorScheme } from '@/hooks/useColorScheme';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch } from 'react-native';

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const [isDark, setIsDark] = useState(scheme === 'dark');

  useEffect(() => {
    const unsub = subscribePreferredColorScheme((v) => {
      if (v === 'light' || v === 'dark') setIsDark(v === 'dark');
      else setIsDark((useColorScheme() ?? 'light') === 'dark');
    });
    return unsub;
  }, []);

  const onToggle = useCallback(async (value: boolean) => {
    setIsDark(value);
    await setPreferredColorScheme(value ? 'dark' : 'light');
    // note: app will reflect new theme because root uses useColorScheme hook
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Configurações</ThemedText>
      <ThemedView style={styles.row}>
        <ThemedText>Tema escuro</ThemedText>
        <Switch value={isDark} onValueChange={onToggle} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
