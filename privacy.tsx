import React, { useState } from "react";
import { Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Luxury } from "../src/theme";
import { GlassCard } from "../src/components/Luxury";
import { realSiteResolve, webShieldScan, emailGuardScan, webcamGate, browserShieldAudit } from "../src/engines/WebPrivacy";

export default function Privacy() {
  const [out, setOut] = useState("Real Site, Web Shield, Email Guard, Webcam + Browser shields ready.");
  const [host, setHost] = useState("mybank.com");
  return (
    <LinearGradient colors={[Luxury.bg, Luxury.bg2]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.c}>
        <Text style={styles.h}>🔒 Web & Privacy Shields</Text>
        <TextInput value={host} onChangeText={setHost} style={styles.input} autoCapitalize="none" />
        <Pressable style={styles.b} onPress={async () => { const r = await realSiteResolve(host); setOut(r.note); }}>
          <Text style={styles.bt}>Verify Real Site (anti-DNS-hijack)</Text>
        </Pressable>
        <Pressable style={styles.b} onPress={() => { const r = webShieldScan('<script src="http://evil.js">eval(atob("x"))'); setOut(r.reason); }}>
          <Text style={styles.bt}>Test Web Shield intercept</Text>
        </Pressable>
        <Pressable style={styles.b} onPress={() => { const r = emailGuardScan({ from: "bank@secure-verify.tk", subject: "Urgent: account suspended", body: "verify now", hasAttachment: false }); setOut(r.reason); }}>
          <Text style={styles.bt}>Test Email Guard (5 mailboxes)</Text>
        </Pressable>
        <Pressable style={styles.b} onPress={() => { const r = webcamGate.prompt("UnknownApp"); setOut(r.msg); }}>
          <Text style={styles.bt}>Test Webcam Shield gate</Text>
        </Pressable>
        <Pressable style={styles.b} onPress={() => { const r = browserShieldAudit(14); setOut(`${r.note} (${r.protected} logins)`); }}>
          <Text style={styles.bt}>Audit Browser Shield vault</Text>
        </Pressable>
        <GlassCard><Text style={styles.t}>Result</Text><Text style={styles.m}>{out}</Text></GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  c: { padding: 22, paddingTop: 70, gap: 10 },
  h: { color: Luxury.text, fontSize: 22, fontWeight: "900" },
  input: { backgroundColor: "rgba(255,255,255,0.07)", color: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Luxury.cardBorder },
  b: { backgroundColor: "rgba(212,175,55,0.14)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Luxury.cardBorder },
  bt: { color: Luxury.goldHi, fontWeight: "800", textAlign: "center", fontSize: 12 },
  t: { color: Luxury.text, fontWeight: "700" },
  m: { color: Luxury.muted, fontSize: 13, marginTop: 6, lineHeight: 19 },
});
