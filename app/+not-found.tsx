import { Link, Stack, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
export default function NotFoundScreen() {
  const pathname = usePathname();
  const path = pathname || "unknown";
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text>Esta tela não existe:</Text>
        <Text style={{ fontWeight: "bold", marginVertical: 8 }}>{path}</Text>
        <Link href="/(tabs)/videos" style={styles.link}>
          <Text>Ir para tela inicial!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
