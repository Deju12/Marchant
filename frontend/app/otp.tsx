import { Link } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";


export default function Otp() {
  
  const [form, setForm] = useState({
    otp: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = () => {
    // Login logic here
    alert("Activated!");
  };

  return (
    <View className="flex-1 justify-center items-center ">
      <Image
        source={require("../assets/images/tslogo.webp")}
        className="w-24 h-24 mb-12"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-green mb-8">Enter OTP</Text>
      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Enter OTP"
        value={form.otp}
        onChangeText={(text) => handleChange("phone", text)}
      />
      
      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleLogin}
      >
        <Text className="text-center text-white font-bold">Activate</Text>
      </TouchableOpacity>
      <Link href="/register" className="text-green font-bold">
             Back
      </Link>
    </View>
  );
}
