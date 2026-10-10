// LinkGuard screen — paste/WhatsApp-shared link → PAUSED → verdict popup → sandbox or block.
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { Luxury } from "../src/theme";
import { GlassCard } from "../src/components/Luxury";
import { interceptUrl, openSandboxed, startClipboardWatch } from "../src/engines/LinkGuard";
import { LinkReport, disclaimerFor } from "../src/engines/ThreatIntel";
import { useShield } from "../src/store";

export default function LinkGuardScreen() {
  const s = useShield();
  const [url, setUrl] = useState("http://whatsapp-gift-claim-verify.bit.ly/free-crypto");
  const [rep, setRep] = useState<LinkReport | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Deep links from WhatsApp-tap / share-sheet land here — auto-intercept, never auto-open.
    const sub = Linking.addEventListener("url", async ({ url: u }) => { setUrl(u); await check(u); });
    startClipboardWatch(r => { setRep(r); setShow(true); }, () => s.linkGuardOn && s.bgOn);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.linkGuardOn, s.bgOn]);

  const check = async (u: string) => {
    const { report } = await interceptUrl(u); // connection paused here
    setRep(report); setShow(true); // verdict popup BEFORE any navigation
  };

  const c = !rep ? Luxury.gold : rep.verdict === "safe" ? Luxury.emerald : rep.verdict === "suspicious" ? Luxury.gold : Luxury.danger;

  return (
    <LinearGradient colors={[Luxury.bg, Luxury.bg2]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.c}>
        <Text style={styles.h}>🛡️ LinkGuard Middleman</Text>
        <Text style={styles.m}>Tap a WhatsApp link → we PAUSE it → inspect server → verdict popup. Malicious pages never load.</Text>
        <TextInput value={url} onChangeText={setUrl} style={styles.input} placeholderTextColor="#666" autoCapitalize="none" />
        <Pressable onPress={() => check(url)} style={styles.btn}>
          <LinearGradient colors={[Luxury.goldHi, Luxury.goldDeep]} style={styles.btnG}>
            <Text style={styles.btnT}>⏸ PAUSE & INSPECT</Text>
          </LinearGradient>
        </Pressable>
        {rep && (
          <GlassCard>
            <Text style={[styles.v, { color: c }]}>{rep.verdict.toUpperCase()} • risk {rep.score}/100</Text>
            <Text style={styles.m}>Host: {rep.landingHost}</Text>
            {rep.reasons.map(r => <Text key={r} style={styles.r}>• {r}</Text>)}
          </GlassCard>
        )}
        <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <View style={styles.overlay}>
            <LinearGradient colors={["#14101E", "#0A0C13"]} style={styles.pop}>
              <Text style={[styles.v, { color: c, fontSize: 22 }]}>
                {rep?.verdict === "safe" ? "✅ SAFE TO OPEN" : rep?.verdict === "suspicious" ? "⚠️ SUSPICIOUS" : "⛔ SCAM BLOCKED"}
              </Text>
              <Text style={styles.m}>{rep && disclaimerFor(rep)}</Text>
              {rep?.verdict === "safe" && (
                <Pressable style={styles.btn} onPress={async () => { setShow(false); await openSandboxed(rep.url); }}>
                  <Text style={styles.btnT2}>Open safely →</Text>
                </Pressable>
              )}
              {rep?.verdict === "suspicious" && (
                <Pressable style={styles.btn} onPress={async () => { setShow(false); await openSandboxed(rep.url); }}>
                  <Text style={styles.btnT2}>Open in Sandbox (isolated) →</Text>
                </Pressable>
              )}
              <Pressable onPress={() => setShow(false)}><Text style={styles.close}>Close — stay protected ✕</Text></Pressable>
            </LinearGradient>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  c: { padding: 22, paddingTop: 70 },
  h: { color: Luxury.text, fontSize: 24, fontWeight: "900" },
  m: { color: Luxury.muted, marginVertical: 8, lineHeight: 20 },
  input: { backgroundColor: "rgba(255,255,255,0.07)", color: "#fff", borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: Luxury.cardBorder },
  btn: { marginVertical: 14, borderRadius: 14, overflow: "hidden" },
  btnG: { padding: 16, alignItems: "center" },
  btnT: { fontWeight: "900", letterSpacing: 1 },
  btnT2: { color: Luxury.gold, fontWeight: "800", textAlign: "center", padding: 12 },
  v: { fontWeight: "900", letterSpacing: 1, marginBottom: 6 },
  r: { color: Luxury.text, fontSize: 13, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 24 },
  pop: { borderRadius: 22, padding: 22, borderWidth: 1, borderColor: Luxury.cardBorder },
  close: { color: Luxury.muted, textAlign: "center", marginTop: 12 },
});
