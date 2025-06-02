import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";

export default function Index() {
  const [form, setForm] = useState({
    customerId: "",
    phone: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    // Clear previous messages
    setSuccessMsg("");
    setErrorMsg("");

    // Front-end validation
    if (!form.customerId.trim()) {
      setErrorMsg("Customer ID is required.");
      return;
    }

    if (!form.phone.trim()) {
      setErrorMsg("Phone Number is required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/employee/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: form.customerId,
          phone_number: form.phone,
          is_active: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Registered successfully!");
        setForm({ customerId: "", phone: "" }); // clear form
        setTimeout(() => {
          setSuccessMsg("");
          router.replace("/otp"); // Redirect to OTP Activation after success
        }, 1000);
      } else if (
        data.message &&
        (data.message.includes("already registered") || data.message.includes("exists") || data.message.includes("Error creating customer"))
      ) {
        setErrorMsg("This phone number is already registered.");
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMsg("Could not connect to the server.");
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
        placeholder="Customer ID"
        value={form.customerId}
        onChangeText={(text) => handleChange("customerId", text)}
      />
      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Phone Number"
        value={form.phone}
        onChangeText={(text) => handleChange("phone", text)}
      />
      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleRegister}
      >
        <Text className="text-center text-white font-bold">Register</Text>
      </TouchableOpacity>
      <Text className="mb-2 text-gray-700">You have an account?</Text>
      <Link href="/" className="text-green font-bold">
        Login here
      </Link>
    </View>
  );
}
