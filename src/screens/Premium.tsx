import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { purchaseSubscription } from '@/services/iapService';
import { supabase } from '../../lib/supabase';

export default function Premium() {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const purchase = await purchaseSubscription();

      if (purchase) {
        const { data } = await supabase.auth.getUser();
        const user = data.user;

        if (user) {
          await supabase
            .from('users')
            .update({
              is_premium: true,
              premium_since: new Date().toISOString(),
            })
            .eq('id', user.id);
        }

        Alert.alert('Success', 'Premium activated 🎉');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Purchase failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F', padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>
        SIP Premium
      </Text>

      <Text style={{ color: '#aaa', marginBottom: 24 }}>
        Unlimited readings • Unlimited Clarify • Unlimited Go Deeper • Full history access
      </Text>

      <TouchableOpacity
        onPress={handlePurchase}
        style={{
          backgroundColor: '#C6A55C',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={{ color: '#000', fontWeight: 'bold' }}>
            Upgrade – $2.99/month
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}