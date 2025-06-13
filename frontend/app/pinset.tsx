import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function Index() {
  const [form, setForm] = useState({
    phone: "",
    name: "",
    pincode: "",
    repincode: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("register_phone_number").then((value) => {
      if (value) setForm((prev) => ({ ...prev, phone: value }));
    });
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    if (!form.phone.trim()) {
      setErrorMsg("Phone Number is required.");
      return;
    }
    if (!form.name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    if (!form.pincode.trim()) {
      setErrorMsg("PIN is required.");
      return;
    }
    if (!form.repincode.trim()) {
      setErrorMsg("PIN Confirmation is required.");
      return;
    }

    try {
      const merchant_id = await AsyncStorage.getItem("register_merchant_id");
      const phone_number = await AsyncStorage.getItem("register_phone_number");

      const response = await fetch("http://localhost:4000/api/pinset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id,
          phone_number,
          name: form.name,
          pin_code: form.pincode,
          repin_code: form.repincode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("PIN Created successfully!");
        setForm({ phone: "", name: "", pincode: "", repincode: "" });
        setTimeout(() => {
          setSuccessMsg("");
          router.replace("/");
        }, 1000);
      } else if (
        data.message &&
        (data.message.includes("PIN already set for this employee.") || data.message.includes("Error creating customer"))
      ) {
        setErrorMsg("This phone number is already registered.");
      } else if (
        data.message &&
        data.message.includes("Phone number not registered.")
      ) {
        setErrorMsg("Phone number not registered.");
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMsg("Could not connect to the server.");
    }

    setTimeout(() => setErrorMsg(""), 3000);
  };

  return (
    <View className="flex-1 justify-center items-center px-4 bg-white">
      <Image
        source={require("../assets/images/tslogo.webp")}
        className="w-24 h-24 mb-12"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-green mb-6">Set Your PIN</Text>

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

      {/* Show phone number (read-only) */}
      <View className="w-72 mb-4">
        <Text className="text-gray-700 mb-1">Phone Number</Text>
        <TextInput
          className="border border-green rounded p-3 bg-gray-100"
          value={form.phone}
          editable={false}
        />
      </View>

      {/* Name input */}
      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Enter Name"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={form.name}
        onChangeText={(text) => handleChange("name", text)}
      />

      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Enter PIN"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={form.pincode}
        onChangeText={(text) => handleChange("pincode", text)}
        secureTextEntry
      />
      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Confirm PIN"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={form.repincode}
        onChangeText={(text) => handleChange("repincode", text)}
        secureTextEntry
      />
      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleRegister}
      >
        <Text className="text-center text-white font-bold">Complete</Text>
      </TouchableOpacity>

      <Link href="/otp" className="text-green font-bold">
        Back
      </Link>
    </View>
  );
}
