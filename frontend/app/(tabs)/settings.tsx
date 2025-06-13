import { View, Text, TouchableOpacity, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState<null | "deactivate" | "pin" | "logout">(null);

  // New state for feedback dialog
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    const checkMerchant = async () => {
      const phone_number = await AsyncStorage.getItem("phone_number");
      const token = await AsyncStorage.getItem("token");
      if (!phone_number || !token) {
        setIsMerchant(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:4000/api/merchants/phone/${phone_number}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        setIsMerchant(res.ok);
      } catch {
        setIsMerchant(false);
      }
    };
    checkMerchant();
  }, []);

  const handleDeactivate = async () => {
    setModalVisible(null);
   const phone_number = await AsyncStorage.getItem("phone_number");
    const merchant_id = await AsyncStorage.getItem("merchant_id");
    

    if (!merchant_id || !phone_number) {
      setFeedbackType("error");
      setFeedbackMessage("Merchant info not found.");
      setFeedbackVisible(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/req_de_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id, phone_number }),
      });
      const data = await response.json();
      if (response.ok) {
        setFeedbackType("success");
        setFeedbackMessage(`OTP sent to merchant. Please check marchant phone.`);
        setFeedbackVisible(true);
        // Redirect after short delay
        setTimeout(() => {
          setFeedbackVisible(false);
          router.push("/de_otp");
        }, 1200);
      } else {
        setFeedbackType("error");
        setFeedbackMessage(data.message || "Failed to send OTP.");
        setFeedbackVisible(true);
      }
    } catch (err) {
      setFeedbackType("error");
      setFeedbackMessage("Network error.");
      setFeedbackVisible(true);
    }
  };

  const handleChangePin = () => {
    setModalVisible(null);
    router.push("/change_pin");
  };

  const handleLogout = async () => {
    setModalVisible(null);
    setIsMerchant(false); // Reset merchant state
    setFeedbackVisible(false);
    setFeedbackMessage("");
    setFeedbackType("success");
    await AsyncStorage.clear();
    // Optionally, force a reload of the app to clear any cached state
    router.replace("/");
 
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="w-80 space-y-4">
        <Image
          source={require("../../assets/images/tslogo.webp")}
          className="w-24 h-24 mb-12"
          resizeMode="contain"
        />
        <TouchableOpacity
          className="bg-red-100 border rounded-xl py-1 mb-2 shadow"
          onPress={() => setModalVisible("deactivate")}
        >
          <Text className="text-red-700 font-bold text-center text-lg">
            Request Deactivation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-yellow-100 border rounded-xl py-1 mb-2 shadow"
          onPress={() => setModalVisible("pin")}
        >
          <Text className="text-yellow-700 font-bold text-center text-lg">
            Change PIN
          </Text>
        </TouchableOpacity>
        {/* Employee List Button (only if isMerchant) */}
        {isMerchant && (
          <TouchableOpacity
            className="bg-green-100 border rounded-xl py-1 mb-2 shadow"
            onPress={() => router.push("/employee_list")}
          >
            <Text className="text-green-700 font-bold text-center text-lg">
              Employee List
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="bg-gray-100 border rounded-xl py-1 mb-2 shadow"
          onPress={() => setModalVisible("logout")}
        >
          <Text className="text-gray-700 font-bold text-center text-lg">
            Logout
          </Text>
        </TouchableOpacity>
        
      </View>

      {/* Feedback Modal */}
      <Modal
        transparent
        visible={feedbackVisible}
        animationType="fade"
        onRequestClose={() => setFeedbackVisible(false)}
      >
        <View className="flex-1 bg-black/25 justify-center items-center">
          <View className="bg-white rounded-2xl p-7 w-72 items-center shadow-lg">
            <Text
              className={`text-lg font-bold mb-4 ${
                feedbackType === "success" ? "text-green-700" : "text-red-700"
              }`}
            >
              {feedbackType === "success" ? "Success" : "Error"}
            </Text>
            <Text className="mb-6 text-center text-gray-700">{feedbackMessage}</Text>
            <TouchableOpacity
              className={`rounded-lg py-2 px-6 ${
                feedbackType === "success" ? "bg-green-100" : "bg-red-100"
              }`}
              onPress={() => setFeedbackVisible(false)}
            >
              <Text
                className={`font-bold ${
                  feedbackType === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dialog Modal */}
      <Modal
        transparent
        visible={modalVisible !== null}
        animationType="fade"
        onRequestClose={() => setModalVisible(null)}
      >
        <View className="flex-1 bg-black/25 justify-center items-center">
          <View className="bg-white rounded-2xl p-7 w-80 items-center shadow-lg">
            {modalVisible === "deactivate" && (
              <>
                <Text className="text-lg font-bold mb-4 text-red-700">
                  Confirm Deactivation
                </Text>
                <Text className="mb-6 text-center text-gray-700">
                  Are you sure you want to request deactivation?
                </Text>
                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    className="bg-red-100 rounded-lg py-2 px-6 mr-2"
                    onPress={handleDeactivate}
                  >
                    <Text className="text-red-700 font-bold">Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-100 rounded-lg py-2 px-6"
                    onPress={() => setModalVisible(null)}
                  >
                    <Text className="text-gray-700 font-bold">No</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {modalVisible === "pin" && (
              <>
                <Text className="text-lg font-bold mb-4 text-yellow-700">
                  Change PIN
                </Text>
                <Text className="mb-6 text-center text-gray-700">
                  Do you want to change your PIN?
                </Text>
                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    className="bg-yellow-100 rounded-lg py-2 px-6 mr-2"
                    onPress={handleChangePin}
                  >
                    <Text className="text-yellow-700 font-bold">Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-100 rounded-lg py-2 px-6"
                    onPress={() => setModalVisible(null)}
                  >
                    <Text className="text-gray-700 font-bold">No</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {modalVisible === "logout" && (
              <>
                <Text className="text-lg font-bold mb-4 text-gray-700">
                  Logout
                </Text>
                <Text className="mb-6 text-center text-gray-700">
                  Are you sure you want to logout?
                </Text>
                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    className="bg-gray-100 rounded-lg py-2 px-6 mr-2"
                    onPress={handleLogout}
                  >
                    <Text className="text-gray-700 font-bold">Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-100 rounded-lg py-2 px-6"
                    onPress={() => setModalVisible(null)}
                  >
                    <Text className="text-red-700 font-bold">No</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}