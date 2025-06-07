import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserScreen() {
  const [employee, setEmployee] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeAndMerchant = async () => {
      const token = await AsyncStorage.getItem("token");
      const employeeId = await AsyncStorage.getItem("employee_id");
      if (!employeeId) {
        setEmployee(null);
        setLoading(false);
        return;
      }
      try {
        // Fetch employee
        const response = await fetch(
          `http://localhost:4000/api/employee/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setEmployee(data);
        await AsyncStorage.setItem("phone_number", data.phone_number);
        await AsyncStorage.setItem("employee_id", data.employee_id);
        await AsyncStorage.setItem("merchant_id", data.merchant_id);

        // Fetch merchant info
        if (data.merchant_id) {
          const merchantRes = await fetch(
            `http://localhost:4000/api/merchants/${data.merchant_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const merchantData = await merchantRes.json();
          setMerchant(merchantData);
        }
      } catch (error) {
        setEmployee(null);
      }
      setLoading(false);
    };
    fetchEmployeeAndMerchant();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
  }

  if (!employee) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-600">Failed to load employee info.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 items-center py-10 px-4">
        {/* Merchant Info */}
        <View className="w-full max-w-md mb-8">
          <Text
            className="text-2xl font-extrabold text-center mb-2"
            style={{ color: "#00C853" }}
          >
            {merchant ? merchant.merchant_name || merchant.name : "Merchant"}
          </Text>
          <Text className="text-center text-base text-gray-700 mb-1">
            Merchant ID:{" "}
            <Text style={{ color: "#00C853", fontWeight: "bold" }}>
              {employee.merchant_id}
            </Text>
          </Text>
          <Text className="text-center text-base text-gray-700 mb-1">
            Phone:{" "}
            <Text style={{ color: "#00C853", fontWeight: "bold" }}>
              {merchant ? merchant.phone_number : "Loading..."}
            </Text>
          </Text>
          <Text className="text-center text-base text-gray-700 mb-1">
            Address:{" "}
            <Text style={{ color: "#00C853", fontWeight: "bold" }}>
              {merchant ? merchant.address : "Loading..."}
            </Text>
          </Text>
        </View>

        {/* Employee Info */}
        <View className="w-full max-w-md border-t border-gray-200 pt-6">
          <Text
            className="text-xl font-bold text-center mb-4"
            style={{ color: "#00C853" }}
          >
            Employee Information
          </Text>
          <Text className="mb-1 text-gray-800 text-base">
            <Text style={{ fontWeight: "bold" }}>ID:</Text> {employee.employee_id || employee.id}
          </Text>
          <Text className="mb-1 text-gray-800 text-base">
            <Text style={{ fontWeight: "bold" }}>Phone:</Text> {employee.phone_number}
          </Text>
          <Text className="mb-1 text-gray-800 text-base">
            <Text style={{ fontWeight: "bold" }}>Name:</Text> {employee.name || "-"}
          </Text>
          <Text className="mb-1 text-gray-800 text-base">
            <Text style={{ fontWeight: "bold" }}>Role:</Text> {employee.role || "-"}
          </Text>
          <Text className="mb-1 text-gray-800 text-base">
            <Text style={{ fontWeight: "bold" }}>Created At:</Text>{" "}
            {employee.created_at
              ? new Date(employee.created_at).toLocaleString()
              : "-"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}