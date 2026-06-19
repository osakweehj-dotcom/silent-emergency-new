import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../../firebaseconfig";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    loadSavedLogin();
  }, []);

  const loadSavedLogin = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("saved_email");
      const savedPassword = await AsyncStorage.getItem("saved_password");

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      // SAVE LOGIN IF REMEMBER ME IS ON
      if (rememberMe) {
        await AsyncStorage.setItem("saved_email", email);
        await AsyncStorage.setItem("saved_password", password);
      } else {
        await AsyncStorage.removeItem("saved_email");
        await AsyncStorage.removeItem("saved_password");
      }

      Alert.alert("Success", "Login successful");

      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);

      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Missing Email",
        "Please enter your email first"
      );

      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        "Password Reset",
        "Reset email sent successfully"
      );
    } catch (error: any) {
      console.log(error);

      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Silent Emergency</Text>

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      {/* PASSWORD */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eye}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* REMEMBER ME */}
      <TouchableOpacity
        style={styles.rememberContainer}
        onPress={() => setRememberMe(!rememberMe)}
      >
        <View style={styles.checkbox}>
          {rememberMe && <View style={styles.checked} />}
        </View>

        <Text style={styles.rememberText}>
          Remember Me
        </Text>
      </TouchableOpacity>

      {/* LOGIN BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* FORGOT PASSWORD */}
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgot}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* SIGNUP */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/signup")}
      >
        <Text style={styles.link}>
          Don't have an account? Create one
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
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  passwordContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 15,
  },

  eye: {
    color: "blue",
    fontWeight: "600",
  },

  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  checked: {
    width: 12,
    height: 12,
    backgroundColor: "black",
  },

  rememberText: {
    fontSize: 14,
  },

  button: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
  },

  forgot: {
    textAlign: "center",
    marginTop: 18,
    color: "blue",
    fontWeight: "600",
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "blue",
  },
});