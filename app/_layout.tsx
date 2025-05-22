import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";

import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: "#F8F9FA",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="plot/[id]" 
        options={{ 
          title: "Plot Details",
          headerBackTitle: "Back",
        }} 
      />
      <Stack.Screen 
        name="plot/[id]/stage/[stageId]" 
        options={{ 
          title: "Stage Details",
          headerBackTitle: "Back",
        }} 
      />
      <Stack.Screen 
        name="plot/new" 
        options={{ 
          title: "Add New Plot",
          headerBackTitle: "Cancel",
        }} 
      />
      <Stack.Screen 
        name="reports" 
        options={{ 
          title: "Reports",
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}