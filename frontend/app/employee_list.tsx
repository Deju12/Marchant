import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";

export const options = {
  tabBarButton: () => null,
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const merchant_id = await AsyncStorage.getItem("merchant_id");
        const token = await AsyncStorage.getItem("token");
        if (!merchant_id || !token) {
          setErrorMsg("Merchant ID or token not found.");
          setLoading(false);
          return;
        }
        const res = await fetch(
          `http://localhost:4000/api/employee/merchant/${merchant_id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.ok) {
          let data = await res.json();
          if (!Array.isArray(data)) data = [];
          setEmployees(data);
        } else {
          setErrorMsg("Failed to fetch employees.");
        }
      } catch (err) {
        setErrorMsg("Could not connect to server.");
      }
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  const openDeactivateDialog = (emp: any) => {
    setSelectedEmp(emp);
    setModalVisible(true);
  };

  const handleDeactivate = async () => {
    setModalVisible(false);
    if (!selectedEmp) return;

    // Get merchant_id and employee phone_number
    const merchant_id = await AsyncStorage.getItem("merchant_id");
    const phone_number = selectedEmp.phone_number;

    if (!merchant_id || !phone_number) {
      // Optionally show an error message here
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
        // Optionally show a success message here
        setTimeout(() => {
          router.push("/de_otp");
        }, 500);
      } else {
        // Optionally show an error message here
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-10">
      <Link href="/settings" className="text-green font-bold">
              Back
      </Link>
      <Text className="text-2xl font-bold text-green-700 mb-6 text-center">Employee List</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#00C853" />
      ) : errorMsg ? (
        <Text className="text-red-600 text-center mb-4">{errorMsg}</Text>
      ) : employees.length === 0 ? (
        <Text className="text-gray-700 text-center">No employees found.</Text>
      ) : (
        <View className="w-full">
          <View className="flex-row border-b border-gray-300 pb-2 mb-2">
            <Text className="flex-1 font-bold text-gray-700">Name</Text>
            <Text className="flex-1 font-bold text-gray-700">Phone</Text>
            <Text className="w-24 font-bold text-gray-700 text-center">Action</Text>
          </View>
          {employees.map((emp) => (
            <View
              key={emp.id}
              className="flex-row items-center border-b border-gray-100 py-2"
            >
              <Text className="flex-1 text-gray-800">{emp.name || "-"}</Text>
              <Text className="flex-1 text-gray-800">{emp.phone_number}</Text>
              <TouchableOpacity
                className="w-24 bg-red-100 rounded px-2 py-1"
                onPress={() => openDeactivateDialog(emp)}
              >
                <Text className="text-red-700 font-bold text-center">Deactivate</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Deactivation Confirmation Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/25 justify-center items-center">
          <View className="bg-white rounded-2xl p-7 w-80 items-center shadow-lg">
            <Text className="text-lg font-bold mb-4 text-red-700">
              Confirm Deactivation
            </Text>
            <Text className="mb-6 text-center text-gray-700">
              Are you sure you want to deactivate{" "}
              <Text className="font-bold text-red-700">
                {selectedEmp?.name || selectedEmp?.phone_number}
              </Text>
              ?
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
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-gray-700 font-bold">No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}