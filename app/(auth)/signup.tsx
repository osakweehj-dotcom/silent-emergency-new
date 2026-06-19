import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseconfig";

export default function Signup() {
  const router = useRouter();

  // 🧾 NEW FIELDS
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");

  // 🔐 AUTH FIELDS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createAccount = async () => {
    try {
      // VALIDATION
      if (
        !fullName ||
        !country ||
        !state ||
        !lga ||
        !email ||
        !password
      ) {
        Alert.alert(
          "Error",
          "Please fill all fields"
        );
        return;
      }

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      Alert.alert(
        "Success",
        "Account created successfully"
      );

      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create Account
      </Text>

      {/* FULL NAME */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* COUNTRY */}
      <TextInput
        style={styles.input}
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
      />

      {/* STATE */}
      <TextInput
        style={styles.input}
        placeholder="State"
        value={state}
        onChangeText={setState}
      />

      {/* LGA */}
      <TextInput
        style={styles.input}
        placeholder="Local Government"
        value={lga}
        onChangeText={setLga}
      />

      {/* EMAIL */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {/* PASSWORD */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={createAccount}
      >
        <Text style={styles.buttonText}>
          Create Account
        </Text>
      </TouchableOpacity>

      {/* LOGIN LINK */}
      <TouchableOpacity
        onPress={() =>
          router.replace("/(auth)/login")
        }
      >
        <Text style={styles.link}>
          Already have account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
  },

  link: {
    marginTop: 20,
    textAlign: "center",
  },
});