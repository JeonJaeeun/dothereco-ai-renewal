import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  FlexibleTask,
  getFlexibleTasks,
  saveFlexibleTasks,
} from '@/storage/scheduleStorage';

export default function TodoListScreen() {
  const [todos, setTodos] = useState<FlexibleTask[]>([]);

  const loadTodos = async () => {
    const data = await getFlexibleTasks();
    setTodos(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadTodos();
    }, [])
  );

  const toggleTodo = async (id: number) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    setTodos(updated);
    await saveFlexibleTasks(updated);
  };

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );

  const pendingCount = todos.length - completedCount;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>할 일</Text>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>남은 일정</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{completedCount}</Text>
          <Text style={styles.summaryLabel}>완료</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {todos.length > 0 ? (
          todos.map((todo) => (
            <TouchableOpacity
              key={todo.id}
              style={[styles.todoCard, todo.completed && styles.completedCard]}
              onPress={() => toggleTodo(todo.id)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.checkCircle,
                  todo.completed && styles.checkedCircle,
                ]}
              >
                {todo.completed && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>

              <View style={styles.todoContent}>
                <Text style={[styles.todoTitle, todo.completed && styles.doneText]}>
                  {todo.title}
                </Text>

                <View style={styles.metaRow}>
                  <View 
                    style={[
                      styles.tagBadge,
                      { backgroundColor: todo.color ?? '#DFF3D7' },
                    ]}
                  >
                    <Text 
                      style={[
                        styles.tagText,
                        { color: todo.textColor ?? '#365C27' },
                      ]}
                    >
                      {todo.tag}
                    </Text>
                  </View>

                  {todo.dday && <Text style={styles.ddayText}>{todo.dday}</Text>}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#B0B0B0" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>아직 유동스케줄이 없어요.</Text>
            <Text style={styles.emptySubText}>+ 버튼으로 할 일을 추가해보세요.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  header: {
    paddingTop: 64,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 34, fontWeight: '800', color: '#4A4A4A' },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#F8FCF5',
  },
  summaryNumber: { fontSize: 28, fontWeight: '900', color: '#365C27' },
  summaryLabel: { marginTop: 6, fontSize: 13, fontWeight: '700', color: '#888' },
  todoCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedCard: { opacity: 0.55 },
  checkCircle: {
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
  checkedCircle: { backgroundColor: '#365C27', borderColor: '#365C27' },
  todoContent: { flex: 1 },
  todoTitle: { fontSize: 17, fontWeight: '800', color: '#4A4A4A' },
  doneText: { textDecorationLine: 'line-through', color: '#999' },
  metaRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  tagBadge: {
    backgroundColor: '#DFF3D7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 11, fontWeight: '800', color: '#365C27' },
  ddayText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
  },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#555' },
  emptySubText: { marginTop: 8, fontSize: 13, color: '#999' },
});