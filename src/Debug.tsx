import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

function Debug() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

  const [ping, setPing] = useState('Pinging…');

  useEffect(() => {
    (async () => {
      try {
        if (!url) return setPing('❌ URL is missing (env not loaded)');
        if (!url.startsWith('https://'))
          return setPing(`❌ URL must start with https://`);

        if (!key) return setPing('❌ ANON KEY missing');

        const res = await fetch(`${url.replace(/\/$/, '')}/auth/v1/health`, {
          headers: { apikey: key },
        });

        setPing(`✅ Reachable. Status: ${res.status}`);
      } catch (e: any) {
        setPing(`❌ Network fail: ${e?.message ?? String(e)}`);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F', padding: 20, justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 22, marginBottom: 12 }}>SIP Debug</Text>
      <Text style={{ color: '#9CA3AF' }}>URL present: {url ? 'YES' : 'NO'}</Text>
      <Text style={{ color: '#9CA3AF' }}>HTTPS: {url.startsWith('https://') ? 'YES' : 'NO'}</Text>
      <Text style={{ color: '#9CA3AF' }}>Key length: {key.length}</Text>
      <Text style={{ color: '#E5E7EB', marginTop: 16 }}>{ping}</Text>
    </View>
  );
}

export default Debug;
