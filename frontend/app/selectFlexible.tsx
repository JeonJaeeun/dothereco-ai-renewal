import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  FlexibleTask,
  getFixedSchedules,
  getFlexibleTasks,
} from '@/storage/scheduleStorage';

export default function SelectFlexibleScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<FlexibleTask[]>([]);

  const loadTasks = async () => {
    const data = await getFlexibleTasks();

    const activeTasks = data
      .filter((task) => !task.completed)
      .map((task) => ({
        ...task,
        selected: task.selected ?? false,
      }));

    setTasks(activeTasks);
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, selected: !task.selected } : task
      )
    );
  };

  const selectedTasks = tasks.filter((task) => task.selected);
  const selectedCount = selectedTasks.length;

  const handleNext = async () => {
    const fixedSchedules = await getFixedSchedules();

    console.log('selectFlexible selectedTasks: ', selectedTasks);
    console.log('selectFlexible fixedSchedules:', fixedSchedules);
    
    router.push({
      pathname: '/input',
      params: {
        tasks: JSON.stringify(selectedTasks),
        fixedSchedules: JSON.stringify(fixedSchedules),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '유동스케줄 선택', headerBackTitle: '뒤로' }} />

      <View style={styles.header}>
        <Text style={styles.title}>추천할 일정 선택</Text>
        <Text style={styles.subtitle}>
          오늘의 타임라인에 넣고 싶은 유동스케줄을 선택해 주세요.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>선택된 일정</Text>
        <Text style={styles.summaryCount}>{selectedCount}개</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, task.selected && styles.selectedTaskCard]}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.checkBox, task.selected && styles.checkedBox]}>
                {task.selected && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>

              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>

                <View style={styles.metaRow}>
                  <View 
                    style={[
                      styles.tagBadge,
                      { backgroundColor: task.color ?? '#DFF3D7' },
                    ]}
                  >
                    <Text 
                      style={[
                        styles.tagText,
                        { color: task.textColor ?? '#365C27' },
                      ]}
                    >
                      {task.tag}
                    </Text>
                  </View>

                  {task.dday && <Text style={styles.ddayText}>{task.dday}</Text>}
                
                  {task.placeKeyword && (
                    <Text style={styles.ddayText}>{task.placeKeyword}</Text>
                  )}
                
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>선택할 유동스케줄이 없어요.</Text>
            <Text style={styles.emptySubText}>할 일 화면에서 유동스케줄을 추가해보세요.</Text>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.nextButton, selectedCount === 0 && styles.disabledButton]}
          disabled={selectedCount === 0}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            선택한 {selectedCount}개 일정으로 다음
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  header: { paddingTop: 18, paddingBottom: 20 },
  title: { fontSize: 30, fontWeight: '800', color: '#4A4A4A' },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 21, color: '#777' },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#F8FCF5',
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: { fontSize: 15, fontWeight: '800', color: '#4A4A4A' },
  summaryCount: { fontSize: 20, fontWeight: '900', color: '#365C27' },
  taskCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTaskCard: { borderColor: '#DCEAD3', backgroundColor: '#F8FCF5' },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkedBox: { backgroundColor: '#365C27', borderColor: '#365C27' },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: '800', color: '#4A4A4A' },
  metaRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  tagBadge: {
    backgroundColor: '#DFF3D7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 11, fontWeight: '800', color: '#365C27' },
  ddayText: { marginLeft: 10, fontSize: 12, fontWeight: '800', color: '#D97706' },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
  },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#555' },
  emptySubText: { marginTop: 8, fontSize: 13, color: '#999', textAlign: 'center' },
  bottomArea: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 28,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#DFF3D7',
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#EEEEEE' },
  nextButtonText: { fontSize: 16, fontWeight: '800', color: '#2F4F24' },
});