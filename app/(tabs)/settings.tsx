import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import * as Notifications from "expo-notifications";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseconfig";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();

  const enableNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      Alert.alert("Success", "Notifications enabled");
    } else {
      Alert.alert("Denied", "Enable notifications in settings");
    }
  };

  const handleUpgrade = () => {
    router.push("/(tabs)/upgrade");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.card} onPress={enableNotifications}>
        <Text>🔔 Enable Notifications</Text>
      </TouchableOpacity>

      {/* UPGRADE BUTTON */}
      <TouchableOpacity style={styles.upgrade} onPress={handleUpgrade}>
        <Text style={{ color: "white", fontWeight: "700" }}>
          💳 Upgrade to Premium (₦2000/month)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={{ color: "white" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 20 },
  card: { padding: 15, backgroundColor: "#eee", borderRadius: 10 },
  upgrade: { backgroundColor: "blue", padding: 15, marginTop: 15, borderRadius: 10 },
  logout: { backgroundColor: "red", padding: 15, marginTop: 20, borderRadius: 10 },
});