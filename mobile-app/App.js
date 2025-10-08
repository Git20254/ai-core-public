import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MusicPlayer from "./components/MusicPlayer";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    fetch("http://192.168.1.157:3000/tracks") // ✅ backend API
      .then((res) => res.json())
      .then((data) => {
        console.log("📀 Tracks fetched:", data); // debug log
        setTracks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tracks:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text>Loading tracks...</Text>
      </SafeAreaView>
    );
  }

  // 🎶 If a track is selected, show the player
  if (selectedTrack) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <MusicPlayer track={selectedTrack} />
        <TouchableOpacity
          onPress={() => setSelectedTrack(null)}
          style={{ padding: 20 }}
        >
          <Text style={{ fontSize: 18, color: "blue", textAlign: "center" }}>
            ⬅️ Back to Playlist
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 📋 Otherwise, show the playlist
  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        🎵 Playlist
      </Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" }}
            onPress={() => {
              console.log("▶️ Selected track:", item); // debug log
              setSelectedTrack(item);
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.title}</Text>
            <Text style={{ fontSize: 14, color: "gray" }}>
              {item.creator?.name || "Unknown Artist"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

