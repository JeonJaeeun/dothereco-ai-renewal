import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import DateSelector from '@/components/DateSelector';
import TimeLineCard from '@/components/TimeLineCard';

import {
  FixedSchedule,
  getFixedSchedules,
} from '@/storage/scheduleStorage';

export default function TimeTableScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);

  const applied = params.applied;
  const timeline = params.timeline;
  const strategy = params.strategy;

  const isApplied = applied === 'true';

  const today = new Date().toISOString().split('T')[0];

  const shownTimeline =
    typeof timeline === 'string'
      ? JSON.parse(timeline)
      : fixedSchedules.filter((schedule) => schedule.date === today);

  const loadSchedules = async () => {
    const data = await getFixedSchedules();
    setFixedSchedules(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>타임라인</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => 
            router.push({
              pathname: '/addSchedule',
              params: {
                finalReturnTo: '/(tabs)/timetable'
              },
            })
          }
        >
          <Ionicons name="add" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <DateSelector />

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => 
            router.push({
              pathname: '/selectFlexible',
              params: {
                fixedSchedules: JSON.stringify(fixedSchedules),
              },
            })
          }
        >
          <Text style={styles.aiButtonText}>
            ✨ AI 일정 추천 받기
          </Text>
        </TouchableOpacity>

        {isApplied && (
          <View style={styles.strategyCard}>
            <Text style={styles.strategyLabel}>
              적용된 추천 전략
            </Text>

            <Text style={styles.strategyText}>
              {typeof strategy === 'string'
                ? strategy
                : '추천 전략'}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          {isApplied
            ? '오늘의 추천 타임라인'
            : '오늘의 고정 타임라인'}
        </Text>

        {shownTimeline.length > 0 ? (
          <TimeLineCard timeBlocks={shownTimeline} />
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              아직 고정스케줄이 없어요.
            </Text>

            <Text style={styles.emptySubText}>
              + 버튼으로 고정스케줄을 추가해보세요.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },

  header: {
    paddingTop: 64,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#4A4A4A',
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiButton: {
    backgroundColor: '#DFF3D7',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 24,
  },

  aiButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2F4F24',
  },

  strategyCard: {
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#F8FCF5',
    marginBottom: 18,
  },

  strategyLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6F9A63',
  },

  strategyText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    color: '#4A4A4A',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    color: '#4A4A4A',
  },

  emptyBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#555',
  },

  emptySubText: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});