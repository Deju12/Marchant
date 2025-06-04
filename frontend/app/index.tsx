import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    pin: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: form.phone,
          pin_code: form.pin,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Save merchant/employee id
        await AsyncStorage.setItem('merchant_id', data.merchant_id.toString());
        router.replace("/home");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
    }
  };

  return (
    <View className="flex-1 justify-center items-center ">
      <Image
        source={require("../assets/images/tslogo.webp")}
        className="w-24 h-24 mb-12"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-green mb-8">Login</Text>
      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Phone Number"
        value={form.phone}
        onChangeText={(text) => handleChange("phone", text)}
      />
      <TextInput
        className="border border-green rounded w-72 p-3 mb-6 bg-white"
        placeholder="PIN Code"
        secureTextEntry
        value={form.pin}
        onChangeText={(text) => handleChange("pin", text)}
      />
      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleLogin}
      >
        <Text className="text-center text-white font-bold">Login</Text>
      </TouchableOpacity>
      <Text className="mb-2 text-gray-700"> Don&apos;t have an account?</Text>
      <Link href="/register" className="text-green font-bold">
        Register here
      </Link>
    </View>
  );
}
