import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const quickOptions = [
  { label: '피곤해요', text: '오늘 피곤해서 여유롭게 짜줘.' },
  { label: '이동 적게', text: '이동이 적은 순서로 짜줘.' },
  { label: '급한 일 먼저', text: '급한 일부터 먼저 처리하고 싶어.' },
  { label: '마감 우선', text: '마감이 가까운 일을 우선으로 넣어줘.' },
  { label: '운동 포함', text: '운동도 가능하면 포함해줘.' },
  { label: '공부 우선', text: '공부 시간을 우선으로 배치해줘.' },
];

type Task = {
  id: number;
  title: string;
  selected?: boolean;
  tag: string;
  dday?: string;
};

export default function InputScreen() {
  const router = useRouter();
  const { tasks, fixedSchedules } = useLocalSearchParams();

  const parsedTasks: Task[] =
    typeof tasks === 'string' ? JSON.parse(tasks) : [];

  const [request, setRequest] = useState('');

  const handleQuickSelect = (text: string) => {
    setRequest((prev) => {
      if (!prev.trim()) return text;
      return `${prev.trim()} ${text}`;
    });
  };

  const handleSubmit = () => {
    console.log('input에서 받은 tasks:', tasks);
    console.log('input에서 받은 fixedSchedules:', fixedSchedules);
    console.log('input에서 보낼 request:', request);
    router.push({
      pathname: '/result',
      params: {
        tasks,
        fixedSchedules,
        request,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'AI 추천 요청', headerBackTitle: '뒤로' }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>오늘은 어떤 하루야?</Text>
          <Text style={styles.subtitle}>
            선택한 유동스케줄을 바탕으로 원하는 일정 추천 방향을 알려주세요.
          </Text>
        </View>

        <View style={styles.selectedCard}>
          <Text style={styles.label}>선택된 유동스케줄</Text>

          {parsedTasks.length > 0 ? (
            parsedTasks.map((task) => (
              <View key={task.id} style={styles.selectedItem}>
                <View style={styles.selectedDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedTitle}>{task.title}</Text>
                  <Text style={styles.selectedTag}>{task.tag}</Text>
                </View>
                {task.dday && <Text style={styles.dday}>{task.dday}</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.emptySelectedText}>
              선택된 유동스케줄이 없습니다.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>빠른 선택</Text>

          <View style={styles.chipContainer}>
            {quickOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.chip}
                onPress={() => handleQuickSelect(option.text)}
              >
                <Text style={styles.chipText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>상황 입력</Text>

          <TextInput
            value={request}
            onChangeText={setRequest}
            placeholder="예: 오늘 피곤해서 이동 적게 하고 싶어. 마트는 꼭 가야 해."
            placeholderTextColor="#A0A0A0"
            style={styles.input}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.clearButton} onPress={() => setRequest('')}>
            <Text style={styles.clearButtonText}>입력 초기화</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, request.trim().length === 0 && styles.disabledButton]}
          disabled={request.trim().length === 0}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>✨ AI 추천 결과 보기</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { padding: 24, paddingBottom: 48 },
  header: { marginTop:0, marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', color: '#4A4A4A' },
  subtitle: { marginTop: 10, fontSize: 15, lineHeight: 22, color: '#777' },

  selectedCard: {
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#365C27',
    marginRight: 10,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  selectedTag: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#6F9A63',
  },
  dday: {
    fontSize: 13,
    fontWeight: '900',
    color: '#365C27',
  },
  emptySelectedText: {
    fontSize: 14,
    color: '#999',
  },

  card: {
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#F8FCF5',
  },
  label: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipText: { fontSize: 13, fontWeight: '800', color: '#365C27' },
  input: {
    height: 140,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    lineHeight: 23,
  },
  clearButton: { alignSelf: 'flex-end', marginTop: 10 },
  clearButtonText: { fontSize: 13, fontWeight: '800', color: '#888' },
  button: {
    marginTop: 24,
    backgroundColor: '#DFF3D7',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#EEEEEE' },
  buttonText: { fontSize: 17, fontWeight: '800', color: '#2F4F24' },
});