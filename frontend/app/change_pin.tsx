import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ChangePinScreen() {
  const [form, setForm] = useState({
    oldpin: "",
    newpin: "",
    renewpin: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleChangePin = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    // Validation
    if (!form.oldpin.trim()) {
      setErrorMsg("Old PIN is required.");
      return;
    }
    if (!form.newpin.trim()) {
      setErrorMsg("New PIN is required.");
      return;
    }
    if (!form.renewpin.trim()) {
      setErrorMsg("PIN confirmation is required.");
      return;
    }
    if (form.newpin !== form.renewpin) {
      setErrorMsg("New PIN and confirmation do not match.");
      return;
    }

    try {
      const phone_number = await AsyncStorage.getItem("phone_number");
      if (!phone_number) {
        setErrorMsg("Phone number not found.");
        return;
      }
      const response = await fetch("http://localhost:4000/api/change_pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number,
          old_pin: form.oldpin,
          new_pin: form.newpin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("PIN changed successfully!");
        setForm({ oldpin: "", newpin: "", renewpin: "" });
        setTimeout(() => {
          setSuccessMsg("");
          router.replace("/"); // Redirect after success
        }, 1000);
      } else {
        setErrorMsg(data.message || "Failed to change PIN.");
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
      <Text className="text-2xl font-bold text-green mb-6">Change Your PIN</Text>

      {/* Success message */}
      {successMsg ? (
        <Text className="text-green bg-green-100 border border-green-300 px-4 py-2 mb-4 rounded w-72 text-center">
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
        placeholder="Enter Old PIN"
        placeholderTextColor="rgba(0,0,0,0.4)"
        secureTextEntry
        value={form.oldpin}
        onChangeText={(text) => handleChange("oldpin", text)}
      />
      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Enter New PIN"
        placeholderTextColor="rgba(0,0,0,0.4)"
        secureTextEntry
        value={form.newpin}
        onChangeText={(text) => handleChange("newpin", text)}
      />
      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Confirm New PIN"
        placeholderTextColor="rgba(0,0,0,0.4)"
        secureTextEntry
        value={form.renewpin}
        onChangeText={(text) => handleChange("renewpin", text)}
      />
      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleChangePin}
      >
        <Text className="text-center text-white font-bold">Change PIN</Text>
      </TouchableOpacity>

      <Link href="/settings" className="text-green font-bold">
        Back
      </Link>
    </View>
  );
}
