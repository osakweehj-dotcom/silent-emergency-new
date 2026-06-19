import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";

import * as Location from "expo-location";

import { auth, db } from "../../firebaseconfig";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";

import { getFunctions, httpsCallable } from "firebase/functions";
import { registerForPushNotificationsAsync } from "../../utils/push";

import { CameraView, useCameraPermissions } from "expo-camera";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Index() {
  const uid = auth.currentUser?.uid;
  const functions = getFunctions();
  const storage = getStorage();

  const SOS_LIMIT = 3;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [contacts, setContacts] = useState<any[]>([]);
  const [userName, setUserName] = useState("");

  const [premium, setPremium] = useState(false);
  const [sosUsed, setSosUsed] = useState(0);

  const [type, setType] = useState("");
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const intervalRef = useRef<any>(null);
  const sendingRef = useRef(false);

  const emergencyOptions = [
    "Medical Emergency 🚑",
    "Accident 🚗",
    "Security Threat 🚨",
    "Fire 🔥",
    "Assault ⚠️",
  ];

  const isBlocked = !premium && sosUsed >= SOS_LIMIT;

  // =========================
  // FIRESTORE SYNC
  // =========================
  useEffect(() => {
    if (!uid) return;

    const ref = doc(db, "users", uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.fullName || "");
        setPremium(data.premium || false);
        setSosUsed(data.sosUsed || 0);
        setContacts(data.contacts || []);
      }
    });

    return () => unsub();
  }, [uid]);

  // =========================
  // PUSH TOKEN
  // =========================
  useEffect(() => {
    const setupPush = async () => {
      if (!uid) return;

      const token = await registerForPushNotificationsAsync();

      if (token) {
        await updateDoc(doc(db, "users", uid), {
          expoPushToken: token,
        });
      }
    };

    setupPush();
  }, [uid]);

  // =========================
  // CAMERA PERMISSION
  // =========================
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // =========================
  // CAMERA CAPTURE
  // =========================
  const captureSOSPhoto = async () => {
    try {
      if (!cameraRef.current) return null;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });

      return photo?.uri;
    } catch (e) {
      console.log("CAMERA ERROR:", e);
      return null;
    }
  };

  // =========================
  // UPLOAD IMAGE
  // =========================
  const uploadImageAsync = async (uri: string) => {
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new TypeError("Network request failed"));
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const fileRef = ref(storage, `sos/${Date.now()}.jpg`);

      await uploadBytes(fileRef, blob);

      const url = await getDownloadURL(fileRef);

      return url;
    } catch (e) {
      console.log("UPLOAD ERROR:", e);
      return null;
    }
  };

  // =========================
  // ADD CONTACT
  // =========================
  const addContact = async () => {
    if (!uid) return;

    if (!name || !phone) return Alert.alert("Error", "Enter name and phone");

    const newContact = {
      id: Date.now().toString(),
      name,
      phone,
      primary: contacts.length === 0,
    };

    const updated = [...contacts, newContact];

    setContacts(updated);

    await updateDoc(doc(db, "users", uid), {
      contacts: updated,
    });

    setName("");
    setPhone("");
  };

  // =========================
  // DELETE CONTACT
  // =========================
  const deleteContact = async (id: string) => {
    if (!uid) return;

    const updated = contacts.filter((c) => c.id !== id);

    setContacts(updated);

    await updateDoc(doc(db, "users", uid), {
      contacts: updated,
    });
  };

  // =========================
  // SOS START
  // =========================
  const sendQuickSOS = async () => {
    if (!uid || sendingRef.current || sosActive) return;

    if (isBlocked) return Alert.alert("Limit Reached");
    if (!type) return Alert.alert("Select Emergency Type");
    if (!contacts.length) return Alert.alert("No Contacts");

    sendingRef.current = true;
    setSosActive(true);
    setCountdown(5);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          triggerSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // =========================
  // SOS TRIGGER
  // =========================
  const triggerSOS = async () => {
    try {
      const callSOS = httpsCallable(functions, "triggerSOS");

      const imageUri = await captureSOSPhoto();
      const imageUrl = imageUri ? await uploadImageAsync(imageUri) : null;

      const res: any = await callSOS({
        type,
        imageUrl,
      });

      console.log("SOS RESPONSE:", res.data);

      Alert.alert("SOS SENT 🚨");
    } catch (e) {
      console.log("SOS ERROR:", e);
      Alert.alert("SOS Failed");
    } finally {
      sendingRef.current = false;
      setSosActive(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ width: 1, height: 1, opacity: 0 }}
        facing="front"
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Silent Emergency</Text>

        {!premium && (
          <Text style={{ color: "red" }}>
            SOS Usage: {sosUsed}/{SOS_LIMIT}
          </Text>
        )}

        <TextInput
          placeholder="Contact Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />

        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Text style={{ color: "white" }}>Add Contact</Text>
        </TouchableOpacity>

        <FlatList
          data={contacts}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onLongPress={() => deleteContact(item.id)}
            >
              <Text>{item.name}</Text>
              <Text>{item.phone}</Text>
            </TouchableOpacity>
          )}
        />

        {emergencyOptions.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.option, type === item && styles.selected]}
            onPress={() => setType(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sosWrapper}>
        <TouchableOpacity style={styles.sosButton} onPress={sendQuickSOS}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {sosActive && (
        <TouchableOpacity
          style={styles.cancel}
          onPress={() => {
            setSosActive(false);
            sendingRef.current = false;
            clearInterval(intervalRef.current);
          }}
        >
          <Text style={{ color: "white" }}>Cancel ({countdown})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#eee",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
  },

  option: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 8,
    borderRadius: 10,
  },

  selected: {
    backgroundColor: "red",
  },

  sosWrapper: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },

  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },

  sosText: {
    color: "white",
    fontSize: 40,
    fontWeight: "900",
  },

  cancel: {
    position: "absolute",
    bottom: 200,
    alignSelf: "center",
    backgroundColor: "black",
    padding: 10,
    borderRadius: 10,
  },
});