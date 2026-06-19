import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { auth, db } from "../../firebaseconfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { WebView } from "react-native-webview";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function Upgrade() {
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(false);
  const [paymentActive, setPaymentActive] = useState(false);

  const MONTH = 30 * 24 * 60 * 60 * 1000;

  const functions = getFunctions();

  if (!uid) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Please login first</Text>
      </View>
    );
  }

  // ✅ SERVER VERIFICATION (ONLY TRUTH SOURCE)
  const verifyPayment = async (transactionId: string) => {
    try {
      const check = httpsCallable(
        functions,
        "verifyFlutterwavePayment"
      );

      const res = await check({ transactionId });

      const data = res.data as { success: boolean };

      if (data.success) {
        await activateSubscription();
      } else {
        Alert.alert("Payment not verified");
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Verification failed", error.message || "Error occurred");
    }
  };

  // 💳 ACTIVATE PREMIUM (ONLY AFTER BACKEND CONFIRMS)
  const activateSubscription = async () => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      const data = snap.data();

      const now = Date.now();

      if (data?.subscriptionEnd && data.subscriptionEnd > now) {
        Alert.alert("Already Active", "You already have premium.");
        setPaymentActive(false);
        return;
      }

      await updateDoc(doc(db, "users", uid), {
        premium: true,
        subscriptionStatus: "active",
        subscriptionStart: now,
        subscriptionEnd: now + MONTH,
      });

      Alert.alert(
        "Success 🚀",
        "Premium activated successfully!"
      );

      setPaymentActive(false);
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.message || "Activation failed");
    }
  };

  // 💰 Flutterwave payment URL
  const paymentUrl = useMemo(() => {
    return "https://sandbox.flutterwave.com/pay/hmrx6t0m37xx";
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Subscription 🚀</Text>

      <View style={styles.card}>
        <Text style={styles.planTitle}>Monthly Plan</Text>
        <Text style={styles.planText}>
          ✔ Unlimited SOS alerts{"\n"}
          ✔ Auto emergency tracking{"\n"}
          ✔ Priority support{"\n"}
          ✔ Active for 30 days
        </Text>
      </View>

      {!paymentActive && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => setPaymentActive(true)}
        >
          <Text style={styles.payText}>Subscribe Now</Text>
        </TouchableOpacity>
      )}

      {paymentActive && (
        <>
          {loading && (
            <ActivityIndicator size="large" color="red" />
          )}

          {/* ⚠️ ONLY PAYMENT UI — NO TRUSTED CALLBACKS */}
          <WebView
            source={{ uri: paymentUrl }}
            startInLoadingState
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </>
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: { fontSize: 16 },

  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    marginVertical: 10,
  },

  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },

  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  planText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },

  payButton: {
    backgroundColor: "red",
    margin: 16,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  payText: {
    color: "white",
    fontWeight: "700",
  },
});