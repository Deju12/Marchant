import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Transaction = {
  id?: number | string;
  amount?: number;
  type?: string;
  customer_name?: string;
  transaction_date?: string;
};

export default function TransactionScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<Transaction>>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [merchantId, setMerchantId] = useState<string | null>(null);

  // ✅ Replace this with your actual backend URL
  const API_URL = 'http://localhost:4000/api/transactions/';

  useEffect(() => {
    // Get merchant ID on mount
    AsyncStorage.getItem('merchant_id').then(id => {
      setMerchantId(id);
      if (id) loadTransactions(id);
    });
  }, []);

  const loadTransactions = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/transactions?merchant_id=${id}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Scroll to top
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
    if (merchantId) await loadTransactions(merchantId);
    setRefreshing(false);
  };

  // ⏱️ Auto-refresh every 2 seconds
  useEffect(() => {
    if (!merchantId) return;
    loadTransactions(merchantId); // initial fetch
    const interval = setInterval(() => {
      loadTransactions(merchantId);
    }, 2000);

    return () => clearInterval(interval);
  }, [merchantId]);

  const renderItem = ({ item }) => (
    <View className="border border-green p-3 mb-3 rounded">
      <Text className="font-extrabold text-green text-2xl mb-1 ">ETB {item.amount ?? '-'}</Text>
      <Text className="text-gray-700  text-xl">Customer: {item.customer_name ?? '-'}</Text>
      <Text className="text-gray-500">{item.transaction_date ? new Date(item.transaction_date).toLocaleString() : ''}</Text>
    </View>
  );

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Filter transactions for today only
  const todaysTransactions = transactions.filter((item) => {
    if (!item.transaction_date) return false;
    const itemDate = new Date(item.transaction_date).toISOString().slice(0, 10);
    return itemDate === todayStr;
  });

  // Sort today's transactions by most recent
  const sortedTransactions = [...todaysTransactions].sort((a, b) => {
    const dateA = new Date(a.transaction_date ?? '').getTime();
    const dateB = new Date(b.transaction_date ?? '').getTime();
    return dateB - dateA; // Most recent first
  });

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Image
             source={require("../assets/images/tslogo.webp")}
             className="w-24 h-12 mb-12"
             resizeMode="contain"
        />
      

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-green">Transactions</Text>
        <TouchableOpacity onPress={onRefresh} accessibilityLabel="Refresh">
          <MaterialIcons name="refresh" size={32} color={refreshing ? "#00C853" : "#FFD600"} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={sortedTransactions}
        keyExtractor={(item, idx) => (item.id ? item.id.toString() : idx.toString())}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={e => setScrollOffset(e.nativeEvent.contentOffset.y)}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-8">No transactions found.</Text>
        }
      />
    </View>
  );
}

