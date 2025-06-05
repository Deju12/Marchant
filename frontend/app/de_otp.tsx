import { Link, router, useLocalSearchParams } from "expo-router";
import { useRef, useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, Image, Pressable } from "react-native";

export default function Index() {
  const [otp, setOtp] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(180); // 3 minutes
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  const params = useLocalSearchParams();
  const merchantId = params.merchantId as string;
  const phone = params.phone as string;

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (text: string) => {
    // Only allow digits and max 6 chars
    const digits = text.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
  };

  const handleOtp = async () => {
    setSuccessMsg("");
    setErrorMsg("");
    if (otp.length < 6) {
      setErrorMsg("OTP is required.");
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/api/ver_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp_code: otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg("Registered successfully!");
        setTimeout(() => {
          setSuccessMsg("");
          router.replace("/pinset");
        }, 1000);
      } else if (
        data.message &&
        (data.message.includes("OTP not found") ||
          data.message.includes("Failed to send OTP") ||
          data.message.includes("Error creating customer"))
      ) {
        setErrorMsg("Invalid OTP");
      } else {
        setErrorMsg(data.message || "OTP expired");
      }
    } catch (error) {
      setErrorMsg("OTP Expired");
    }
    setTimeout(() => setErrorMsg(""), 3000);
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch("http://localhost:4000/api/req_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          phone_number: phone,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg("OTP resent successfully!");
        setResendTimer(90);
      } else {
        setErrorMsg(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      setErrorMsg("Could not resend OTP");
    }
    setIsResending(false);
    setTimeout(() => setErrorMsg(""), 3000);
  };

  return (
    <View className="flex-1 justify-center items-center px-4 bg-white">
      <Image
        source={require("../assets/images/tslogo.webp")}
        className="w-24 h-24 mb-12"
        resizeMode="contain"
      />
      <Text className="text-xl text-green mb-6">OTP sent to merchant.</Text>
      <Text className="text-2xl font-bold text-green mb-6">Enter OTP</Text>

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

      {/* OTP Receiver Boxes */}
      <Pressable
        className="flex-row justify-center mb-6"
        onPress={() => inputRef.current?.focus()}
      >
        {[...Array(6)].map((_, idx) => (
          <View
            key={idx}
            className="border border-green rounded mx-1 w-10 h-12 bg-white justify-center items-center"
          >
            <Text className="text-2xl text-center">
              {otp[idx] ? otp[idx] : ""}
            </Text>
          </View>
        ))}
        {/* Hidden input for actual typing/pasting */}
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="number-pad"
          maxLength={6}
          style={{
            position: "absolute",
            opacity: 0,
            width: 1,
            height: 1,
          }}
          autoFocus
        />
      </Pressable>

      {/* Resend OTP */}
      <View className="mb-4">
        {resendTimer > 0 ? (
          <Text className="text-gray-500 text-center">
            Resend OTP in {Math.floor(resendTimer / 60)}:
            {(resendTimer % 60).toString().padStart(2, "0")}
          </Text>
        ) : (
          <TouchableOpacity
            className="py-2 px-4 rounded bg-green"
            onPress={handleResendOtp}
            disabled={isResending}
          >
            <Text className="text-white font-bold">
              {isResending ? "Resending..." : "Resend OTP"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        className="bg-green w-72 py-3 rounded mb-4"
        onPress={handleOtp}
      >
        <Text className="text-center text-white font-bold">Activate</Text>
      </TouchableOpacity>

      <Link href="/settings" className="text-green font-bold">
        Back
      </Link>
    </View>
  );
}
