import React from "react";
import { Tabs } from "expo-router";
import { BarChart3, Calendar, Home } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.card,
        },
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}