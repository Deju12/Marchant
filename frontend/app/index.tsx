import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { Link } from "expo-router";

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = () => {
    // Login logic here
    alert("Logged in!");
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
        value={form.username}
        onChangeText={(text) => handleChange("phone", text)}
      />
      <TextInput
        className="border border-green rounded w-72 p-3 mb-6 bg-white"
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
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
