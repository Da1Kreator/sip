import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

import Intro from './Intro';
import HowItWorks from './HowItWorks';
import Review from './Review';
import ReadingCard from './ReadingCard';
import History from './History';

/* ---------- helpers ---------- */
function base64ToUint8Array(base64: string) {
  const binary = (global as any).atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

type Message = {
  role: 'assistant' | 'user';
  text: string;
};

type Screen = 'intro' | 'how' | 'camera' | 'review' | 'reading' | 'history';

export default function Home() {
  const cameraRef = useRef<any>(null);
  const uploadLock = useRef(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [screen, setScreen] = useState<Screen>('intro');
  const [booted, setBooted] = useState(false);

  const [photos, setPhotos] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraMsg, setCameraMsg] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [readingId, setReadingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  /* ---------- BOOT (prevents flashing) ---------- */
  useEffect(() => {
    (async () => {
      const seen = await SecureStore.getItemAsync('sip_seen_how_it_works');
      setScreen(seen ? 'camera' : 'intro');
      setBooted(true);
    })();
  }, []);

  if (!booted) return null;

  /* ---------- intro / how ---------- */
  const handleIntroBegin = () => {
    setScreen('how');
  };

  const dismissHowItWorks = async () => {
    await SecureStore.setItemAsync('sip_seen_how_it_works', 'true');
    setScreen('camera');
  };

  /* ---------- camera ---------- */
  const takePhoto = async () => {
    try {
      setCameraMsg(null);
      if (!cameraReady) return setCameraMsg('Camera starting…');
      if (photos.length >= 5) return;

      const pic = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (pic?.uri) setPhotos((p) => [...p, pic.uri]);
    } catch {
      setCameraMsg('Could not take photo.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  /* ---------- upload + initial reading ---------- */
  const uploadAndRead = async () => {
    if (uploadLock.current) return;
    uploadLock.current = true;

    setLoading(true);
    setError(null);

    try {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) throw new Error('auth');

      const userId = s.session.user.id;

      const { data: row, error: insertErr } = await supabase
        .from('readings')
        .insert({ user_id: userId, focus: 'general', full_text: null })
        .select('id')
        .single();

      if (insertErr || !row) {
        throw new Error('Failed to create reading');
      }

      setReadingId(row.id);

      const uploadedUrls: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const base64 = await FileSystem.readAsStringAsync(photos[i], {
          encoding: 'base64' as any,
        });

        const bytes = base64ToUint8Array(base64);
        const path = `${userId}/${row.id}/${i + 1}.jpg`;

        await supabase.storage.from('reading-images').upload(path, bytes, {
          contentType: 'image/jpeg',
          upsert: true,
        });

        const { data: pub } = supabase.storage
          .from('reading-images')
          .getPublicUrl(path);

        uploadedUrls.push(pub.publicUrl);

        await supabase.from('reading_images').insert({
          reading_id: row.id,
          image_url: pub.publicUrl,
        });
      }

      setImageUrls(uploadedUrls);

      const res = await fetch(
        'https://oqsakczbjwsjaadnsfoi.supabase.co/functions/v1/sip-reading',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
          body: JSON.stringify({ image_urls: uploadedUrls }),
        }
      );

      const fn = await res.json();
      if (!res.ok || !fn?.reading) throw new Error('ai');

      await supabase
        .from('readings')
        .update({ full_text: fn.reading })
        .eq('id', row.id);

      setMessages([{ role: 'assistant', text: fn.reading }]);
      setScreen('reading');
    } catch {
      setError('The reader is quiet right now. Try again shortly.');
    } finally {
      uploadLock.current = false;
      setLoading(false);
    }
  };

  /* ---------- follow-ups ---------- */
  const sendFollowUp = async (prompt: string) => {
    if (!readingId) return;

    setLoading(true);
    setMessages((m) => [...m, { role: 'user', text: prompt }]);

    try {
      const res = await fetch(
        'https://oqsakczbjwsjaadnsfoi.supabase.co/functions/v1/sip-reading',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
          body: JSON.stringify({
            image_urls: imageUrls,
            follow_up: prompt,
          }),
        }
      );

      const fn = await res.json();
      if (!res.ok || !fn?.reading) throw new Error('ai');

      setMessages((m) => [...m, { role: 'assistant', text: fn.reading }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'The reader pauses. Try again shortly.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- screens ---------- */
  if (screen === 'intro') return <Intro onBegin={handleIntroBegin} />;
  if (screen === 'how') return <HowItWorks onClose={dismissHowItWorks} />;

  if (screen === 'reading') {
    return (
      <ReadingCard
        readingId={readingId!}
        messages={messages}
        loading={loading}
        onBack={() => setScreen('camera')}
        onAsk={(q) => sendFollowUp(q)}
        onClarify={() => sendFollowUp('Clarify what stands out most.')}
        onDeeper={() => sendFollowUp('Go deeper into the meaning.')}
      />
    );
  }

  if (screen === 'history') {
    return (
      <History
        onBack={() => setScreen('camera')}
        onOpenReading={(id, text) => {
          setReadingId(id);
          setMessages([{ role: 'assistant', text }]);
          setScreen('reading');
        }}
      />
    );
  }

  if (screen === 'review') {
    return (
      <Review
        photos={photos}
        onRemove={removePhoto}
        onBack={() => setScreen('camera')}
        onContinue={uploadAndRead}
        loading={loading}
        error={error}
      />
    );
  }

  /* ---------- permissions ---------- */
  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', marginBottom: 12 }}>Camera access needed</Text>
        <Pressable onPress={requestPermission} style={{ backgroundColor: '#E5E7EB', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: '#111827' }}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

/* ---------- camera ---------- */
return (
  <View style={{ flex: 1, backgroundColor: '#000' }}>
    <CameraView
      ref={cameraRef}
      style={{ flex: 1 }}
      onCameraReady={() => setCameraReady(true)}
    />

    {/* ---------- ACTION BAR (LOCKED) ---------- */}
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 48, // 🔒 LOCKED HEIGHT (matches Review + Reading)
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 16,
        backgroundColor: 'rgba(11,11,15,0.92)',
        borderTopWidth: 1,
        borderColor: '#15151D',
      }}
    >
      <Text style={{ color: '#E5E7EB', marginBottom: 8, textAlign: 'center' }}>
        {photos.length} / 5 images
      </Text>

      {!!cameraMsg && (
        <Text
          style={{
            color: '#FCA5A5',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {cameraMsg}
        </Text>
      )}

      <Pressable
        onPress={takePhoto}
        disabled={!cameraReady}
        style={{
          backgroundColor: '#E5E7EB',
          paddingVertical: 16,
          borderRadius: 20,
          alignItems: 'center',
          opacity: !cameraReady ? 0.6 : 1,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          Capture Image
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setScreen('review')}
        disabled={photos.length === 0}
        style={{
          marginTop: 12,
          backgroundColor: '#6D28D9',
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: 'center',
          opacity: photos.length === 0 ? 0.5 : 1,
        }}
      >
        <Text style={{ color: '#fff' }}>Review photos</Text>
      </Pressable>

      <Pressable
        onPress={() => setScreen('history')}
        style={{
          marginTop: 10,
          paddingVertical: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#9CA3AF' }}>View past readings</Text>
      </Pressable>
    </View>
  </View>
);
}