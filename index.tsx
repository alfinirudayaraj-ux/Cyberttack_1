// Luxury dashboard — obsidian + gold, 3D orb, one-tap Smart Scan, LinkGuard entry.
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { ShieldOrb, GlassCard } from "../src/components/Luxury";
import { Luxury, FEATURE_MATRIX } from "../src/theme";
import { useShield } from "../src/store";
import { requestBackgroundConsent } from "../src/services/BackgroundService";
import { fastScan } from "../src/engines/AntivirusEngine";

const DEMO_FILES = ["DCIM/photo1.jpg", "Download/whatsapp-gold-premium.apk", "Documents/report.pdf", "Download/system-update.apk", "Music/song.mp3"];

export default function Dashboard() {
  const s = useShield();
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  const toggleBg = async (v: boolean) => {
    if (v) {
      Alert.alert("Run in background?", "LinkGuard + shields stay active after you close the app (battery-optimized, low-power).", [
        { text: "Cancel", style: "cancel" },
        { text: "Allow", onPress: async () => { await requestBackgroundConsent(true); s.set({ bgOn: true }); } },
      ]);
    } else { await requestBackgroundConsent(false); s.set({ bgOn: false }); }
  };

  const smartScan = async () => {
    setScanning(true);
    const r = await fastScan(DEMO_FILES, setProgress);
    setScanning(false); setProgress(0);
    s.set({ lastScan: new Date().toLocaleTimeString(), threatsBlocked: s.threatsBlocked + r.threats.length });
    Alert.alert(r.clean ? "Device is clean" : `${r.threats.length} threat(s) quarantined`, r.clean ? `Scanned ${r.filesScanned} files in ${r.ms}ms` : r.threats.map(t => `• ${t.name}`).join("\n"));
  };

  return (
    <LinearGradient colors={[Luxury.bg, Luxury.bg2, "#141021"]} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.c} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>AVAST<Text style={styles.gold}> LUXE</Text></Text>
        <Text style={styles.sub}>PREMIUM SECURITY • ULTRA FAST</Text>
        <ShieldOrb score={100} onPress={smartScan} />
        <Text style={styles.scan}>{scanning ? `Scanning ${(progress * 100) | 0}%…` : s.threatsBlocked + " threats blocked lifetime"}</Text>

        <GlassCard style={styles.row}>
          <View><Text style={styles.t}>Background Shield</Text><Text style={styles.m}>Stays on after app close (with permission)</Text></View>
          <Switch value={s.bgOn} onValueChange={toggleBg} thumbColor={Luxury.gold} trackColor={{ true: "#3a2f10", false: "#333" }} />
        </GlassCard>

        <GlassCard style={styles.row}>
          <View><Text style={styles.t}>LinkGuard Middleman</Text><Text style={styles.m}>Pause → inspect → verdict before any page loads</Text></View>
          <Switch value={s.linkGuardOn} onValueChange={v => s.set({ linkGuardOn: v })} thumbColor={Luxury.gold} trackColor={{ true: "#3a2f10", false: "#333" }} />
        </GlassCard>

        <View style={styles.grid}>
          {[
            { h: "LinkGuard", d: "Test scam links", to: "/linkguard", e: "🛡️" },
            { h: "Network", d: "Firewall + Wi-Fi", to: "/network", e: "🌐" },
            { h: "Privacy", d: "Real Site + Mail", to: "/privacy", e: "🔒" },
            { h: "Vault", d: "Ransom + Shred", to: "/vault", e: "💎" },
          ].map(c => (
            <Link key={c.h} href={c.to as any} asChild>
              <Pressable style={styles.tile}>
                <Text style={styles.emoji}>{c.e}</Text>
                <Text style={styles.t}>{c.h}</Text>
                <Text style={styles.m}>{c.d}</Text>
              </Pressable>
            </Link>
          ))}
        </View>

        <Pressable onPress={smartScan} style={styles.cta}>
          <LinearGradient colors={[Luxury.goldHi, Luxury.gold, Luxury.goldDeep]} style={styles.ctaG}>
            <Text style={styles.ctaT}>{scanning ? "SCANNING…" : "⚡ SMART SCAN"}</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.matrixH}>ALL 16 ENGINES • ACTIVE</Text>
        {FEATURE_MATRIX.map(f => (
          <View key={f.name} style={styles.frow}>
            <Text style={styles.t}>{f.name}</Text>
            <Text style={f.mode === "Active" ? styles.on : styles.man}>{f.mode}</Text>
          </View>
        ))}
        <Text style={styles.foot}>Last scan: {s.lastScan}</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  c: { padding: 22, paddingTop: 60, alignItems: "center" },
  brand: { color: Luxury.text, fontSize: 30, fontWeight: "900", letterSpacing: 3 },
  gold: { color: Luxury.gold },
  sub: { color: Luxury.muted, letterSpacing: 4, fontSize: 10, marginBottom: 10 },
  scan: { color: Luxury.emerald, marginVertical: 12, fontWeight: "700" },
  row: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  t: { color: Luxury.text, fontWeight: "700" },
  m: { color: Luxury.muted, fontSize: 12, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16, width: "100%" },
  tile: { width: "48%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Luxury.cardBorder },
  emoji: { fontSize: 26 },
  cta: { width: "100%", marginTop: 18, borderRadius: 18, overflow: "hidden" },
  ctaG: { padding: 18, alignItems: "center" },
  ctaT: { fontWeight: "900", letterSpacing: 2 },
  matrixH: { color: Luxury.gold, letterSpacing: 2, fontSize: 11, marginTop: 24, marginBottom: 8, fontWeight: "800" },
  frow: { width: "100%", flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  on: { color: Luxury.emerald, fontWeight: "800", fontSize: 12 },
  man: { color: Luxury.gold, fontWeight: "800", fontSize: 12 },
  foot: { color: Luxury.muted, marginVertical: 20, fontSize: 12 },
});
