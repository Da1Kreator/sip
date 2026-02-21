import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setMsg('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Account created ✅ You can log in now.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg('Logged in ✅');
      }
    } catch (e: any) {
      setMsg(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#fff', fontSize: 32, marginBottom: 8 }}>SIP</Text>
      <Text style={{ color: '#9CA3AF', marginBottom: 24 }}>
        {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
      </Text>

      <Text style={{ color: '#9CA3AF', marginBottom: 6 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor="#6B7280"
        style={{
          backgroundColor: '#15151D',
          color: '#fff',
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
        }}
      />

      <Text style={{ color: '#9CA3AF', marginBottom: 6 }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        placeholderTextColor="#6B7280"
        style={{
          backgroundColor: '#15151D',
          color: '#fff',
          padding: 12,
          borderRadius: 12,
          marginBottom: 16,
        }}
      />

      <Pressable
        onPress={submit}
        disabled={loading}
        style={{
          backgroundColor: '#E5E7EB',
          padding: 14,
          borderRadius: 14,
          alignItems: 'center',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: '#111827', fontWeight: '600' }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
        style={{ padding: 14, alignItems: 'center' }}
      >
        <Text style={{ color: '#9CA3AF' }}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </Text>
      </Pressable>

      {!!msg && <Text style={{ color: '#FCA5A5', marginTop: 10 }}>{msg}</Text>}
    </View>
  );
}
