import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";

export default function Index() {
  const [form, setForm] = useState({
    otp: "",
    
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleOtp = async () => {
    // Clear previous messages
    setSuccessMsg("");
    setErrorMsg("");

    // Front-end validation
    if (!form.otp.trim()) {
      setErrorMsg("OTP is required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/ver_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp_code: form.otp,
          
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Registered successfully!");
        setTimeout(() => {
          setSuccessMsg("");
          router.replace("/pinset"); // Redirect to OTP Activation after success
        }, 1000);
      } else if (
        data.message &&
        (data.message.includes("OTP not found") || data.message.includes("Failed to send OTP") || data.message.includes("Error creating customer"))
      ) {
        setErrorMsg("Invalid OTP");
      } else {
        setErrorMsg(data.message || "OTP expired");
      }
    } catch (error) {
      setErrorMsg("OTP Expired");
    }

    // Auto-clear error message after 3 seconds
    setTimeout(() => setErrorMsg(""), 3000);
  };

  return (
    <View className="flex-1 justify-center items-center px-4 bg-white">
      <Image
        source={require("../assets/images/tslogo.webp")}
        className="w-24 h-24 mb-12"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-green mb-6">Register</Text>

      {/* Success message */}
      {successMsg ? (
        <Text className="text-green  bg-green-100 border border-green-300 px-4 py-2 mb-4 rounded w-72 text-center">
          {successMsg}
        </Text>
      ) : null}

      {/* Error message */}
      {errorMsg ? (
        <Text className="text-red-700 bg-red-100 border border-red-300 px-4 py-2 mb-4 rounded w-72 text-center">
          {errorMsg}
        </Text>
      ) : null}

      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Enter OTP"
        value={form.otp}
        onChangeText={(text) => handleChange("otp", text)}
      />
    
      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleOtp}
      >
        <Text className="text-center text-white font-bold">Activate</Text>
      </TouchableOpacity>
      
      <Link href="/register" className="text-green font-bold">
        Back
      </Link>
    </View>
  );
}
