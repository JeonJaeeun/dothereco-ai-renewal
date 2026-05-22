import { API_BASE_URL } from '@/api/config';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type Task = {
  id: number;
  title: string;
  tag: string;
  dday?: string;
};

type TimelineItem = {
  id: number;
  time: string;
  endTime?: string;
  title: string;
  place: string;
  tag?: string;
  type: 'fixed' | 'flexible';
  moveMinutes?: number;
  durationMinutes?: number;
};

type UnplacedTask = {
  id: number;
  title: string;
  reason: string;
};

type RecommendationData = {
  strategy: string;
  summary: string;
  reflectedTasks: Task[];
  reasons: string[];
  timeline: TimelineItem[];
  unplacedTasks?: UnplacedTask[];
};

export default function ResultScreen() {
  const router = useRouter();
  const { tasks, fixedSchedules, request } = useLocalSearchParams();

  const parsedTasks = tasks ? JSON.parse(tasks as string) : [];
  const parsedFixedSchedules =
    typeof fixedSchedules === 'string' ? JSON.parse(fixedSchedules) : [];

  const todayString = new Date().toISOString().split('T')[0];

  const todayFixedSchedules = parsedFixedSchedules.filter(
    (schedule: any) => schedule.date === todayString
  );

  const userRequest =
    typeof request === 'string' ? request : '';
  const [data, setData] = useState<RecommendationData | null>(null);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showApplied, setShowApplied] = useState(false);

  const handleApply = () => {
    setShowApplied(true);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(700),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace({
        pathname: '/(tabs)/timetable',
        params: {
          applied: 'true',
          timeline: JSON.stringify(data?.timeline),
          strategy: data?.strategy,
        },
      });
    });
  };

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        
        const response = await fetch(`${API_BASE_URL}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userRequest,
            selectedTasks: parsedTasks,
            fixedSchedules: todayFixedSchedules,
          }),
        });

        console.log('result parsedTasks:', parsedTasks);
        console.log('result todayFixedSchedules:', todayFixedSchedules);
        console.log('result request:', userRequest);

        const result = await response.json();
        console.log('서버 응답:', result);
        setData(result);
      } catch (err) {
        console.error('추천 요청 실패:', err);
        setError('추천 결과를 불러오지 못했어요.');
      }
    };

    fetchRecommendation();
  }, []);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: '추천 결과', headerBackTitle: 'AI 요청' }} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubText}>
          백엔드 서버가 켜져 있는지 확인해 주세요.
        </Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: '추천 결과', headerBackTitle: 'AI 요청' }} />
        <ActivityIndicator size="large" color="#365C27" />
        <Text style={styles.loadingText}>추천 생성 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: '추천 결과', headerBackTitle: 'AI 요청' }} />

      <Text style={styles.title}>AI 추천 결과</Text>
      <Text style={styles.subtitle}>{data.summary}</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>오늘의 추천 전략</Text>
        <Text style={styles.summaryTitle}>{data.strategy}</Text>
        <Text style={styles.summaryText}>
          입력한 요청 “{userRequest}”을 반영했어요.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>추천에 반영된 일정</Text>

        <View style={styles.taskList}>
          {(data.reflectedTasks ?? []).map((task) => (
            <View key={task.id} style={styles.taskChip}>
              <Text style={styles.taskChipText}>{task.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.reasonCard}>
        <Text style={styles.reasonTitle}>추천 이유</Text>

        <View style={styles.reasonHighlight}>
          <Text style={styles.reasonHighlightTitle}>이번 추천은 이렇게 계산했어요</Text>
          <Text style={styles.reasonHighlightText}>
            고정스케줄 사이의 빈 시간, 이동시간, 예상 소요시간을 함께 고려했어요.
          </Text>
        </View>

        {(data.reasons ?? []).slice(0,4).map((reason) => (
          <View key={reason} style={styles.reasonItem}>
            <View style={styles.reasonDot} />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}
      </View>

      {data.unplacedTasks && data.unplacedTasks.length > 0 && (
        <View style={styles.unplacedCard}>
          <Text style={styles.unplacedTitle}>배치하지 못한 일정</Text>

          {data.unplacedTasks.map((task) => (
            <View key={task.id} style={styles.unplacedItem}>
              <Text style={styles.unplacedName}>{task.title}</Text>
              <Text style={styles.unplacedReason}>{task.reason}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>추천 타임라인</Text>

      <View style={styles.timeline}>
        {(data.timeline ?? []).map((item, index) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.time}>{item.time}</Text>

            <View style={styles.lineArea}>
              <View style={styles.dot} />
              {index !== data.timeline.length - 1 && <View style={styles.line} />}
            </View>

            <View style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.badge}>
                  {item.type === 'fixed' ? '고정' : '유동'}
                </Text>
              </View>

              <Text style={styles.place}>{item.place}</Text>
              {item.type === 'flexible' && (
                <Text style={styles.metaInfo}>
                  이동 약 {item.moveMinutes ?? 0}분
                  {item.durationMinutes ? ` · 소요 ${item.durationMinutes}분` : ''}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <Text style={styles.applyButtonText}>이 일정 적용하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.retryButton}>
        <Text style={styles.retryButtonText}>다른 추천 보기</Text>
      </TouchableOpacity>

      {showApplied && (
        <Animated.View style={[styles.appliedToast, { opacity: fadeAnim }]}>
          <Text style={styles.appliedToastText}>일정이 적용되었어요 ✨</Text>
        </Animated.View>
      )}
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#365C27',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#444',
  },
  errorSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginTop: 34,
    fontSize: 30,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#777',
    marginBottom: 22,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#2F4F24',
    marginBottom: 18,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DFF3D7',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summaryText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#EAF6E5',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#F8FCF5',
    borderWidth: 1,
    borderColor: '#DCEAD3',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  taskList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  taskChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#365C27',
  },
  reasonCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 24,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#365C27',
    marginBottom: 10,
  },
  reasonText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 23,
    marginBottom: 4,
    marginHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A4A4A',
    marginBottom: 16,
  },
  timeline: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  time: {
    width: 60,
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    paddingTop: 8,
  },
  lineArea: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#365C27',
    marginTop: 10,
    zIndex: 2,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#DCEAD3',
    marginTop: 2,
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: '#F4FAF0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCEAD3',
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#444',
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#365C27',
    backgroundColor: '#DFF3D7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  place: {
    marginTop: 8,
    fontSize: 14,
    color: '#777',
  },
  applyButton: {
    backgroundColor: '#DFF3D7',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2F4F24',
  },
  retryButton: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCEAD3',
    marginBottom: 40,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#365C27',
  },
  appliedToast: {
  position: 'absolute',
  left: 24,
  right: 24,
  bottom: 50,
  backgroundColor: '#2F4F24',
  borderRadius: 18,
  paddingVertical: 16,
  alignItems: 'center',
  },
  appliedToastText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  reasonHighlight: {
  backgroundColor: '#F8FCF5',
  borderRadius: 16,
  padding: 14,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: '#DCEAD3',
  },
  reasonHighlightTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#365C27',
  },
  reasonHighlightText: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6F9A63',
    marginTop: 8,
    marginRight: 10,
  },
  metaInfo: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#6F9A63',
  },
  unplacedCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FFF8F3',
    borderWidth: 1,
    borderColor: '#FFE0C2',
    marginBottom: 24,
  },
  unplacedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C65D1E',
    marginBottom: 12,
  },
  unplacedItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFE7D2',
  },
  unplacedName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  unplacedReason: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: '#8A6A55',
  },
});