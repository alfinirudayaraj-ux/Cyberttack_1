import React, { useState } from "react";
import { Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Luxury } from "../src/theme";
import { GlassCard } from "../src/components/Luxury";
import { ransomwareCheck, shred, checkUpdates, sandboxInfo } from "../src/engines/DataVault";

export default function Vault() {
  const [out, setOut] = useState("Ransomware Shield guarding Documents / Pictures / Desktop / DCIM.");
  const [prog, setProg] = useState(0);
  return (
    <LinearGradient colors={[Luxury.bg, Luxury.bg2]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.c}>
        <Text style={styles.h}>💎 Data Vault & Utilities</Text>
        <Pressable style={styles.b} onPress={() => { const r = ransomwareCheck("EvilEncryptor", "Pictures", "encrypt"); setOut(r.reason); }}>
          <Text style={styles.bt}>Test Ransomware Shield</Text>
        </Pressable>
        <GlassCard><Text style={styles.t}>Sandbox Mode (Manual)</Text><Text style={styles.m}>{sandboxInfo.mode}. Use LinkGuard's "Open in Sandbox" for any suspicious link/app.</Text></GlassCard>
        <Pressable style={styles.b} onPress={async () => { const r = await shred(["bank-statement.pdf", "otp-screenshot.png"], 3, setProg); setOut(`Shredded ${r.shredded} files, 3-pass overwrite, ${r.ms}ms — unrecoverable`); setProg(0); }}>
          <Text style={styles.bt}>Data Shredder {(prog * 100) | 0}%</Text>
        </Pressable>
        <Pressable style={styles.b} onPress={async () => { const u = await checkUpdates(); setOut(u.map(x => `${x.app}: ${x.from} → ${x.to} (${x.cve})`).join("\n")); }}>
          <Text style={styles.bt}>Software Updater — patch check</Text>
        </Pressable>
        <GlassCard><Text style={styles.t}>Status</Text><Text style={styles.m}>{out}</Text></GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  c: { padding: 22, paddingTop: 70, gap: 10 },
  h: { color: Luxury.text, fontSize: 22, fontWeight: "900" },
  b: { backgroundColor: "rgba(212,175,55,0.14)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Luxury.cardBorder },
  bt: { color: Luxury.goldHi, fontWeight: "800", textAlign: "center", fontSize: 12 },
  t: { color: Luxury.text, fontWeight: "700" },
  m: { color: Luxury.muted, fontSize: 13, marginTop: 6, lineHeight: 19 },
});
