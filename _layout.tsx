import { Stack } from "expo-router";
import { ShieldProvider } from "../src/store";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <ShieldProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#06070B" }, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="linkguard" />
        <Stack.Screen name="network" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="vault" />
      </Stack>
    </ShieldProvider>
  );
}
