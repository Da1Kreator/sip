import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Message = {
  role: 'assistant' | 'user';
  text: string;
};

type Props = {
  readingId: string;
  messages: Message[];
  loading: boolean;
  onBack: () => void;
  onAsk: (question: string) => void;
  onClarify: () => void;
  onDeeper: () => void;
};

export default function ReadingCard({
  messages,
  loading,
  onBack,
  onAsk,
  onClarify,
  onDeeper,
}: Props) {
  const [question, setQuestion] = useState('');

  const submitQuestion = () => {
    if (!question.trim() || loading) return;
    onAsk(question.trim());
    setQuestion('');
  };

  return (
    <LinearGradient
      colors={['#1A1326', '#0D0B12', '#08070C']}
      locations={[0, 0.5, 1]}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Pressable onPress={onBack}>
            <Text style={{ color: '#9CA3AF' }}>← Back</Text>
          </Pressable>

          <Text style={{ color: '#F3F4F6', fontSize: 28, marginTop: 8 }}>
            Your Reading
          </Text>
          <Text style={{ color: '#A1A1AA', marginTop: 6 }}>
            What remains has meaning.
          </Text>
        </View>

        {/* Reading Content */}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 260,
          }}
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={{
                alignSelf:
                  m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor:
                  m.role === 'user'
                    ? '#1E1A2F'
                    : '#151222',
                borderRadius: 18,
                padding: 16,
                marginBottom: 12,
                maxWidth: '92%',
                borderWidth: 1,
                borderColor:
                  m.role === 'assistant'
                    ? '#2A1E3A'
                    : '#2C2840',
                shadowColor:
                  m.role === 'assistant'
                    ? '#5B3B8A'
                    : '#000',
                shadowOpacity: 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: '#E5E7EB',
                  lineHeight: 24,
                  fontSize: 15,
                }}
              >
                {m.text}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <ActivityIndicator />
              <Text style={{ color: '#A1A1AA', marginTop: 6 }}>
                The cup is settling…
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Bar */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 24,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 14,
            backgroundColor: 'rgba(8,7,12,0.97)',
            borderTopWidth: 1,
            borderColor: '#2A1E3A',
          }}
        >
          {/* Ask */}
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 12,
              alignItems: 'center',
            }}
          >
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask about what you see…"
              placeholderTextColor="#6B7280"
              editable={!loading}
              style={{
                flex: 1,
                backgroundColor: '#151222',
                color: '#fff',
                padding: 14,
                borderRadius: 16,
                marginRight: 8,
                borderWidth: 1,
                borderColor: '#2A1E3A',
              }}
            />

            <Pressable
              onPress={submitQuestion}
              disabled={loading}
              style={{
                backgroundColor: '#E5E7EB',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#111827', fontWeight: '600' }}>
                Ask
              </Text>
            </Pressable>
          </View>

          {/* Quick actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={onClarify}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#1E1A2F',
                paddingVertical: 14,
                borderRadius: 18,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#2A1E3A',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#E5E7EB' }}>Clarify</Text>
            </Pressable>

            <Pressable
              onPress={onDeeper}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#1E1A2F',
                paddingVertical: 14,
                borderRadius: 18,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#2A1E3A',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#E5E7EB' }}>Go deeper</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}











































