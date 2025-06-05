import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+251");
  const [form, setForm] = useState({ phone: "", pin: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, "");
    if (digits.length <= 9) {
      setForm({ ...form, phone: digits });
    }
  };

  const handleLogin = async () => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const fullPhone = countryCode + form.phone;
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: fullPhone,
          pin_code: form.pin,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg("Login successful! Redirecting...");

        // Store token and merchant_id
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
        }
        if (data.merchant_id) {
          await AsyncStorage.setItem('merchant_id', data.merchant_id.toString());
        }
        if (data.employee_id) {
          await AsyncStorage.setItem("employee_id", data.employee_id.toString());
        }

        setTimeout(() => {
          setSuccessMsg("");
          router.replace("/home");
        }, 1000);
      } else {
        setErrorMsg(data.message || "Invalid credentials");
      }
    } catch (error) {
      setErrorMsg("Could not connect to server");
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
      {successMsg ? (
        <View className="bg-green-100 border border-green-400 rounded p-3 mb-4 w-72">
          <Text className="text-green-800 text-center">{successMsg}</Text>
        </View>
      ) : null}
      {errorMsg ? (
        <View className="bg-red-100 border border-red-400 rounded p-3 mb-4 w-72">
          <Text className="text-red-800 text-center">{errorMsg}</Text>
        </View>
      ) : null}
      <View className="flex-row items-center mb-4">
        <Picker
          selectedValue={countryCode}
          style={{ height: 40, width: 100 }}
          onValueChange={(itemValue) => setCountryCode(itemValue)}
        >
          <Picker.Item label="+251 (ET)" value="+251" />
          {/* Add more countries as needed */}
        </Picker>
        <TextInput
          className="border border-green rounded p-3 bg-white flex-1 ml-2"
          placeholder="911000000"
          placeholderTextColor="rgba(0,0,0,0.4)"
          keyboardType="number-pad"
          maxLength={9}
          value={form.phone}
          onChangeText={handlePhoneChange}
        />
      </View>
      <TextInput
        className="border border-green rounded w-72 p-3 mb-6 bg-white"
        placeholder="PIN Code"
         placeholderTextColor="rgba(0,0,0,0.4)"
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
