import { View, Text, TouchableOpacity, Alert, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState<null | "deactivate" | "pin" | "logout">(null);

  const handleDeactivate = async () => {
    setModalVisible(null);
    Alert.alert("Deactivation", "Deactivation request sent.");
  };

  const handleChangePin = () => {
    setModalVisible(null);
    router.push("/pinset");
  };

  const handleLogout = async () => {
    setModalVisible(null);
    await AsyncStorage.clear();
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
        <TouchableOpacity
          className="bg-gray-100 border rounded-xl py-1 mb-2 shadow"
          onPress={() => setModalVisible("logout")}
        >
          <Text className="text-gray-700 font-bold text-center text-lg">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

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