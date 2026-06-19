import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

export default function Dashboard() {
  const [location, setLocation] = useState<any>(null);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setError("Location permission denied");
          setLoading(false);
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };

        setLocation(coords);

        const geo = await Location.reverseGeocodeAsync(coords);

        if (geo.length > 0) {
          const place = geo[0];

          const formatted = `${place.name || ""} ${place.street || ""}, ${place.city || ""}, ${place.region || ""}, ${place.country || ""}`;

          setAddress(formatted.trim());
        }

        setLoading(false);
      } catch (e) {
        console.log(e);
        setError("Failed to get location");
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="red" />
        <Text>Getting location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Your Current Location</Text>

      <Text style={styles.text}>
        {address || "No address found"}
      </Text>

      <Text style={styles.coords}>
        Latitude: {location?.latitude}
      </Text>

      <Text style={styles.coords}>
        Longitude: {location?.longitude}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  coords: {
    fontSize: 14,
    color: "gray",
  },
  error: {
    color: "red",
  },
});