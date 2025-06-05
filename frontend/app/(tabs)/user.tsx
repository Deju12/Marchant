import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserScreen() {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      const token = await AsyncStorage.getItem("token");
      const employeeId = await AsyncStorage.getItem("employee_id");
       // Make sure you store this after login!
      if (!employeeId) {
        setEmployee(null);
        setLoading(false);
        return;
      }
      try {
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
      } catch (error) {
        setEmployee(null);
      }
      setLoading(false);
    };
    fetchEmployee();
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
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl font-bold mb-4">User Profile</Text>
      <Text className="mb-2">ID: {employee.employee_id}</Text>
      <Text className="mb-2">Phone: {employee.phone_number}</Text>
      {/* Add more fields as needed */}
    </View>
  );
}