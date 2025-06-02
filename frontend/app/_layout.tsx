import "../global.css"
import { Stack } from "expo-router";
export const navigationOptions = {
  headerShown: false,
};
export default function RootLayout() {
   
  return <Stack screenOptions={{ headerShown: false }}/>;
  
}
