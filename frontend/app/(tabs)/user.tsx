import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView , Image} from "react-native";
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
          `http://localhost:4000/api/employee/id/${employeeId}`,
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
            `http://localhost:4000/api/merchants/id/${data.merchant_id}`,
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
         <Image
            source={require("../../assets/images/tslogo.webp")}
            className="w-24 h-24 mb-12"
            resizeMode="contain"
          />
        {/* Merchant Info */}
        <View className="w-full max-w-md mb-8">
          <Text className="text-2xl font-extrabold text-center mb-2 text-green">
            {merchant ? merchant.merchant_name || merchant.name : "Merchant"}
          </Text>
          <Text className="text-center text-base text-gray-700 mb-1">
            Merchant ID:{" "}
            <Text className="text-green-600 font-bold">
              {employee.merchant_id}
            </Text>
          </Text>
          <Text className="text-center text-base text-green mb-1">
            Phone:{" "}
            <Text className="text-green-600 font-bold">
              {merchant ? merchant.phone_number : "Loading..."}
            </Text>
          </Text>
          <Text className="text-center text-base text-gray-700 mb-1">
            Address:{" "}
            <Text className="text-green-600 font-bold">
              {merchant ? merchant.address : "Loading..."}
            </Text>
          </Text>
        </View>

        {/* Employee Info */}
        <View className="w-full max-w-md border-t border-gray-200 pt-6 items-center">
          <Text className="text-xl font-bold text-center mb-4 text-green">
            Employee Information
          </Text>
        
          <Text className="mb-1 text-gray-800 text-base text-center">
            <Text className="font-normal text-green">Phone:</Text> {employee.phone_number}
          </Text>
          <Text className="mb-1 text-gray-800 text-base text-center">
            <Text className="font-normal text-green">Name:</Text> {employee.name || "-"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}