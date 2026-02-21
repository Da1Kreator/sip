import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  onClose: () => void;
};

const slides = [
  {
    title: 'Sip',
    body: `Sip slowly. Let the cup empty naturally.

This works best with thicker coffee — Turkish coffee or espresso — which leaves visible grounds.`,
  },
  {
    title: 'Flip',
    body: `Place the saucer over the cup.
Turn it upside down.
Let it rest.`,
  },
  {
    title: 'Reveal',
    body: `Turn the cup upright again.
Notice the patterns inside.

Photograph the inside walls, all four sides, and the bottom.`,
  },
  {
    title: 'Reflect',
    body: `The shapes are interpreted symbolically —
not as guarantees,
but as reflections.`,
  },
];

export default function HowItWorks({ onClose }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
      setIndex(index + 1);
    } else {
      onClose();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      
      {/* Background Atmosphere */}
      <Image
        source={require('../assets/coffee_intro.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.08,
        }}
        resizeMode="cover"
      />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {slides.map((slide, i) => (
          <View
            key={i}
            style={{
              width,
              paddingHorizontal: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 36,
                fontWeight: '600',
                marginBottom: 24,
                letterSpacing: 1,
              }}
            >
              {slide.title}
            </Text>

            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 17,
                textAlign: 'center',
                lineHeight: 28,
                maxWidth: 320,
              }}
            >
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 70,
          width: '100%',
          alignItems: 'center',
        }}
      >
        <Pressable
          onPress={next}
          style={{
            backgroundColor: '#E5E7EB',
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 26,
          }}
        >
          <Text style={{ color: '#111827', fontWeight: '600', fontSize: 16 }}>
            {index === slides.length - 1 ? 'Begin' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}






