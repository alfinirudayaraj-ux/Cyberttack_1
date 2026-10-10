import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Luxury } from "../src/theme";
import { GlassCard } from "../src/components/Luxury";
import { firewallCheck, rdpAttempt, inspectWifi, WifiReport } from "../src/engines/NetworkDefense";
import { behaviorVerdict, cyberCapture } from "../src/engines/AntivirusEngine";

export default function Network() {
  const [log, setLog] = useState<string[]>(["Firewall active — monitoring traffic"]);
  const [wifi, setWifi] = useState<WifiReport | null>(null);
  const add = (m: string) => setLog(p => [new Date().toLocaleTimeString() + "  " + m, ...p].slice(0, 20));

  return (
    <LinearGradient colors={[Luxury.bg, Luxury.bg2]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.c}>
        <Text style={styles.h}>🌐 Network & Hacking Defense</Text>
        <View style={styles.row}>
          <Pressable style={styles.b} onPress={() => { const r = firewallCheck("ChatApp", "c2-server.evil.ru/login"); add(r.reason); }}>
            <Text style={styles.bt}>Test Firewall Block</Text>
          </Pressable>
          <Pressable style={styles.b} onPress={() => { const r = rdpAttempt("185.22.14.9"); add(r.reason); }}>
            <Text style={styles.bt}>Simulate RDP brute-force</Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          <Pressable style={styles.b} onPress={async () => setWifi(await inspectWifi())}>
            <Text style={styles.bt}>Inspect Wi-Fi</Text>
          </Pressable>
          <Pressable style={styles.b} onPress={async () => { const c = await cyberCapture("free-premium-mod.apk", true); add(`CyberCapture: rare file held → ${c.verdict}`); }}>
            <Text style={styles.bt}>CyberCapture test</Text>
          </Pressable>
        </View>
        <Pressable style={styles.b} onPress={() => { const v = behaviorVerdict({ app: "Flashlight", action: "enable device_admin" }); add(v.reason); }}>
          <Text style={styles.bt}>Behavior Shield test (zero-day)</Text>
        </Pressable>
        {wifi && (
          <GlassCard><Text style={styles.t}>{wifi.ssid} • {wifi.encryption} • {wifi.score}/100</Text>
            {wifi.issues.map(i => <Text key={i} style={styles.m}>• {i}</Text>)}
            <Text style={styles.m}>Devices: {wifi.devices.join(", ")}</Text>
          </GlassCard>
        )}
        <GlassCard><Text style={styles.t}>Live shield log</Text>{log.map(l => <Text key={l} style={styles.m}>• {l}</Text>)}</GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  c: { padding: 22, paddingTop: 70, gap: 12 },
  h: { color: Luxury.text, fontSize: 22, fontWeight: "900" },
  row: { flexDirection: "row", gap: 10 },
  b: { flex: 1, backgroundColor: "rgba(212,175,55,0.14)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Luxury.cardBorder },
  bt: { color: Luxury.goldHi, fontWeight: "800", textAlign: "center", fontSize: 12 },
  t: { color: Luxury.text, fontWeight: "700" },
  m: { color: Luxury.muted, fontSize: 12, marginTop: 4 },
});
