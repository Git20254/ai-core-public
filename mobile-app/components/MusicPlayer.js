import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";

export default function MusicPlayer({ track }) {
  console.log("🎧 MusicPlayer received track:", track);

  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [track]);

  async function loadSound() {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: track.url },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );
    setSound(newSound);
  }

  function onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
    }
  }

  async function togglePlayPause() {
    if (!sound) return;
    if (playing) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setPlaying(!playing);
  }

  async function seek(value) {
    if (sound) {
      const newPosition = value * duration;
      await sound.setPositionAsync(newPosition);
    }
  }

  return (
    <View style={{ padding: 20, alignItems: "center" }}>
      {/* 🎨 Album Artwork */}
      <Image
  source={
    track.id === "me-against-world"
      ? require("../assets/me-against-world.jpg") // 👈 local fallback
      : { uri: track.artwork || "https://via.placeholder.com/300.png?text=Album+Art" }
  }
  style={{
    width: 300,
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
    resizeMode: "cover",
  }}
/>

      {/* 🎵 Track Title */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 5 }}>
        {track.title || "Unknown Title"}
      </Text>

      {/* 👤 Artist */}
      <Text style={{ fontSize: 16, color: "gray", marginBottom: 15 }}>
        {track.creator?.name || "Unknown Artist"}
      </Text>

      {/* ⏱ Progress Slider */}
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={1}
        value={position / duration}
        onSlidingComplete={seek}
      />

      {/* ▶️ / ⏸ Controls */}
      <TouchableOpacity onPress={togglePlayPause} style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 22 }}>
          {playing ? "⏸ Pause" : "▶️ Play"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

