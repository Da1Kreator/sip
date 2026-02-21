import React from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';

type Props = {
  onBegin: () => void;
};

export default function Intro({ onBegin }: Props) {
  return (
    <ImageBackground
      source={require('../assets/intro-coffee.jpg')}
      style={{ flex: 1, justifyContent: 'center' }}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          paddingHorizontal: 30,
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 40,
            fontWeight: '700',
            marginBottom: 20,
          }}
        >
          SIP
        </Text>

        <Text
          style={{
            color: '#E5E7EB',
            fontSize: 18,
            lineHeight: 26,
            marginBottom: 40,
          }}
        >
          Sip your coffee. Reflect on what remains.
        </Text>

        <Pressable
          onPress={onBegin}
          style={{
            backgroundColor: '#E5E7EB',
            paddingVertical: 16,
            borderRadius: 24,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#111827',
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            Begin
          </Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}


