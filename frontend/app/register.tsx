import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [form, setForm] = useState({
    customerId: "",
    phone: "",
  });
  const [countryCode, setCountryCode] = useState("+251");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // Only allow 9 digits for phone
  const handlePhoneChange = (text: string) => {
    // Remove non-digit characters
    const digits = text.replace(/\D/g, "");
    // Limit to 9 digits
    if (digits.length <= 9) {
      setForm({ ...form, phone: digits });
    }
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
      const fullPhone = countryCode + form.phone;
      const response = await fetch("http://localhost:4000/api/req_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: form.customerId,
          phone_number: fullPhone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Registered successfully!");
        setForm({ customerId: "", phone: "" }); // clear form
        // Save phone number and merchant ID for later use (for pinset)
        await AsyncStorage.setItem("register_phone_number", countryCode + form.phone);
        await AsyncStorage.setItem("register_merchant_id", form.customerId);
        setTimeout(() => {
          setSuccessMsg("");
          router.replace({
            pathname: "/otp",
            params: {
              merchantId: form.customerId,
              phone: countryCode + form.phone,
            },
          }); // Redirect to OTP Activation after success
        }, 1000);
      } else if (
        data.message &&
        (data.message.includes("already registered") || data.message.includes("Failed to send OTP") || data.message.includes("This phone number is already registered."))
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
        placeholder="Merchant ID"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={form.customerId}
        onChangeText={(text) => handleChange("customerId", text)}
      />

      {/* Phone number with country code picker */}
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

      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleRegister}
      >
        <Text className="text-center text-white font-bold">Register</Text>
      </TouchableOpacity>
      <Text className="mb-2 text-gray-700">Do you have an account?</Text>
      <Link href="/" className="text-green font-bold">
        Login here
      </Link>
    </View>
  );
}
