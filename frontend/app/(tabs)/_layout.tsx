import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "home";
          if (route.name === "user") iconName = "person";
          if (route.name === "settings") iconName = "settings";
          return <MaterialIcons name={iconName} size={size} color={color} className="bg-red"/>;
        },
        tabBarActiveTintColor: "#00C853",
        tabBarInactiveTintColor: "#888",
      })}
    >

       <Tabs.Screen name="user" options={{ title: "User" }} />
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />

    </Tabs>
  );
}