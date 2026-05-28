import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

/** If the user is already logged in, skip the auth screens and go straight to the app. */
export default function AuthLayout() {
  const { session, loading } = useAuth();

  // Still resolving — let the root layout handle the spinner
  if (loading) return null;

  // Already signed in → bounce to the main app
  if (session) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
