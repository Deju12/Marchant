import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function Index() {
  const [form, setForm] = useState({
    phone: "",
    pincode: "",
    repincode: "",
  });
  const [countryCode, setCountryCode] = useState("+251");
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

  const handleRegister = async () => {
    // Clear previous messages
    setSuccessMsg("");
    setErrorMsg("");

    // Front-end validation
    if (!form.phone.trim()) {
      setErrorMsg("Phone Number is required.");
      return;
    }

    if (!form.pincode.trim()) {
      setErrorMsg("PIN is required.");
      return;
    }
     if (!form.repincode.trim()) {
      setErrorMsg("PIN Comfirmation is required.");
      return;
    }

    try {
      const fullPhone = countryCode + form.phone;
      const response = await fetch("http://localhost:4000/api/pinset/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: fullPhone,
          pin_code: form.pincode,
          repin_code: form.repincode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("PIN Created successfully!");
        setForm({ phone: "", pincode: "", repincode: "" }); // clear form
        setTimeout(() => {
          setSuccessMsg("");
          router.replace("/"); // Redirect to OTP Activation after success
        }, 1000);
      } else if (
        data.message &&
        (data.message.includes("PIN already set for this employee.") || data.message.includes("Error creating customer"))
      ) {
        setErrorMsg("This phone number is already registered.");
      }else if (
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

      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Enter PIN"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={form.pincode}
        onChangeText={(text) => handleChange("pincode", text)}
      />
      <TextInput
        className="border border-green rounded w-72 p-3 mb-4 bg-white"
        placeholder="Confirm PIN"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={form.repincode}
        onChangeText={(text) => handleChange("repincode", text)}
      />
      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleRegister}
      >
        <Text className="text-center text-white font-bold">Complate</Text>
      </TouchableOpacity>
      
      <Link href="/otp" className="text-green font-bold">
        Back
      </Link>
    </View>
  );
}
