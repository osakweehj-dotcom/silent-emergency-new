import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";

export default function Explore() {
  const openSettings = () => {
    Alert.alert(
      "Settings",
      "Go to Settings tab to manage app features."
    );
  };

  // 📞 QUICK SOS CALL
  const quickCall = () => {
    Linking.openURL("tel:112");
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Safety Center</Text>

        <Text style={styles.subtitle}>
          Learn and manage emergency readiness.
        </Text>
      </View>

      {/* GUIDE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📘 Emergency Guide</Text>

        <Text style={styles.cardText}>
          • Press SOS if in danger{"\n"}
          • Keep emergency contacts updated{"\n"}
          • Enable location permissions{"\n"}
          • Test your emergency contacts monthly
        </Text>
      </View>

      {/* QUICK SOS CALL */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📞 Quick Emergency Call</Text>

        <Text style={styles.cardText}>
          Tap below to instantly call emergency services (112).
        </Text>

        <TouchableOpacity style={styles.buttonRed} onPress={quickCall}>
          <Text style={styles.buttonText}>Call 112</Text>
        </TouchableOpacity>
      </View>

      {/* SAFETY TIPS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡 What to do in Emergency</Text>

        <Text style={styles.cardText}>
          • Stay calm and assess danger{"\n"}
          • Move to a safe location if possible{"\n"}
          • Press SOS immediately{"\n"}
          • Share your location with trusted contacts{"\n"}
          • Avoid confrontation if possible
        </Text>
      </View>

      {/* SETTINGS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Settings</Text>

        <Text style={styles.cardText}>
          Manage SMS alerts and app behavior.
        </Text>

        <TouchableOpacity style={styles.buttonBlue} onPress={openSettings}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F8",
  },

  header: {
    padding: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 8,
    color: "#6B7280",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    padding: 18,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardText: {
    color: "#4B5563",
    lineHeight: 22,
  },

  buttonBlue: {
    marginTop: 16,
    backgroundColor: "#0A84FF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonRed: {
    marginTop: 16,
    backgroundColor: "#DC2626",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});