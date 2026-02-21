import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

type Props = {
  photos: string[];
  onRemove: (index: number) => void;
  onBack: () => void;
  onContinue: () => void;
  loading: boolean;
  error: string | null;
};

export default function Review({
  photos,
  onRemove,
  onBack,
  onContinue,
  loading,
  error,
}: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F', paddingTop: 56 }}>
      {/* ---------- Header ---------- */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <Pressable onPress={onBack}>
          <Text style={{ color: '#9CA3AF' }}>← Back</Text>
        </Pressable>

        <Text style={{ color: '#fff', fontSize: 28, marginTop: 8 }}>
          Review your cup
        </Text>
        <Text style={{ color: '#9CA3AF', marginTop: 6 }}>
          Remove anything that doesn’t belong.
        </Text>
      </View>

      {/* ---------- Photos ---------- */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 240, // 🔒 space reserved for action bar
        }}
        keyboardShouldPersistTaps="handled"
      >
        {photos.map((uri, index) => (
          <View
            key={index}
            style={{
              marginBottom: 14,
              borderRadius: 18,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#15151D',
            }}
          >
            <Image
              source={{ uri }}
              style={{ width: '100%', height: 220 }}
              resizeMode="cover"
            />

            <Pressable
              onPress={() => onRemove(index)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(0,0,0,0.7)',
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FCA5A5' }}>Remove</Text>
            </Pressable>
          </View>
        ))}

        {photos.length === 0 && (
          <Text
            style={{
              color: '#9CA3AF',
              textAlign: 'center',
              marginTop: 40,
            }}
          >
            No photos selected.
          </Text>
        )}

        {!!error && (
          <Text
            style={{
              color: '#FCA5A5',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        )}
      </ScrollView>

      {/* ---------- ACTION BAR (LOCKED) ---------- */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 48, // 🔒 FIXED HEIGHT — matches ReadingCard
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 16,
          backgroundColor: '#0B0B0F',
          borderTopWidth: 1,
          borderColor: '#15151D',
        }}
      >
        <Pressable
          onPress={onContinue}
          disabled={loading || photos.length === 0}
          style={{
            backgroundColor: '#E5E7EB',
            paddingVertical: 16,
            borderRadius: 20,
            alignItems: 'center',
            opacity: loading || photos.length === 0 ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={{
                color: '#111827',
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              Continue to reading
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}









