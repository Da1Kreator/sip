import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

type ReadingRow = {
  id: string;
  full_text: string | null;
  created_at: string;
  archived: boolean;
};

export default function History({
  onOpenReading,
  onBack,
}: {
  onOpenReading: (readingId: string, readingText: string) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('readings')
      .select('id, full_text, created_at, archived')
      .eq('archived', tab === 'archived')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load history error:', error);
    } else if (data) {
      setReadings(data);
    }

    setLoading(false);
  };

  /* ---------- ACTIONS ---------- */

  const archiveReading = async (id: string) => {
    await supabase.from('readings').update({ archived: true }).eq('id', id);
    loadHistory();
  };

  const restoreReading = async (id: string) => {
    await supabase.from('readings').update({ archived: false }).eq('id', id);
    loadHistory();
  };

  const deleteReading = (id: string) => {
    Alert.alert(
      'Delete reading?',
      'This will permanently remove this reading and its images.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1️⃣ delete images FIRST (foreign key safety)
              const { error: imgErr } = await supabase
                .from('reading_images')
                .delete()
                .eq('reading_id', id);

              if (imgErr) {
                console.error('Delete images error:', imgErr);
                return;
              }

              // 2️⃣ delete reading
              const { error: readErr } = await supabase
                .from('readings')
                .delete()
                .eq('id', id);

              if (readErr) {
                console.error('Delete reading error:', readErr);
                return;
              }

              loadHistory();
            } catch (e) {
              console.error('Unexpected delete error:', e);
            }
          },
        },
      ]
    );
  };

  /* ---------- UI ---------- */

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F', paddingTop: 60 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <Pressable onPress={onBack}>
          <Text style={{ color: '#9CA3AF' }}>← Back</Text>
        </Pressable>

        <Text style={{ color: '#fff', fontSize: 28, marginTop: 8 }}>
          Your Readings
        </Text>

        <Text style={{ color: '#9CA3AF', marginTop: 6 }}>
          What once appeared can return again.
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 }}>
        {(['active', 'archived'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: tab === t ? '#15151D' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: tab === t ? '#fff' : '#6B7280',
                fontWeight: '600',
              }}
            >
              {t === 'active' ? 'Active' : 'Archived'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {readings.length === 0 && (
            <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>
              No readings here.
            </Text>
          )}

          {readings.map((r) => (
            <View
              key={r.id}
              style={{
                backgroundColor: '#0F0F16',
                borderRadius: 20,
                padding: 18,
                marginHorizontal: 20,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#15151D',
              }}
            >
              <Pressable onPress={() => onOpenReading(r.id, r.full_text ?? '')}>
                <Text style={{ color: '#E5E7EB', marginBottom: 6 }}>
                  {r.full_text
                    ? r.full_text.slice(0, 120) + '…'
                    : 'Reading'}
                </Text>

                <Text style={{ color: '#6B7280', fontSize: 12 }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </Text>
              </Pressable>

              {/* Actions */}
              {tab === 'active' && (
                <Pressable
                  onPress={() => archiveReading(r.id)}
                  style={{
                    marginTop: 12,
                    backgroundColor: '#15151D',
                    paddingVertical: 10,
                    borderRadius: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff' }}>Archive</Text>
                </Pressable>
              )}

              {tab === 'archived' && (
                <>
                  <Pressable
                    onPress={() => restoreReading(r.id)}
                    style={{
                      marginTop: 12,
                      backgroundColor: '#15151D',
                      paddingVertical: 10,
                      borderRadius: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff' }}>Restore</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => deleteReading(r.id)}
                    style={{
                      marginTop: 8,
                      backgroundColor: '#3A0D0D',
                      paddingVertical: 10,
                      borderRadius: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FCA5A5' }}>
                      Delete permanently
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}













