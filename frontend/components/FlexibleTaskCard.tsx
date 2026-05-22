import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Task = {
  id: number;
  title: string;
  selected: boolean;
  tag: string;
  dday?: string;
};

type Props = {
  tasks: Task[];
  onToggle: (id: number) => void;
};

export default function FlexibleTaskCard({ tasks, onToggle }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>추천에 넣을 유동스케줄</Text>
      <Text style={styles.description}>오늘 처리할 일정을 선택해 주세요.</Text>

      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          style={styles.taskRow}
          onPress={() => onToggle(task.id)}
        >
          <Ionicons
            name={task.selected ? 'checkbox' : 'square-outline'}
            size={24}
            color={task.selected ? '#365C27' : '#777'}
          />

          <View style={styles.taskContent}>
            <Text style={styles.taskText}>{task.title}</Text>
            <Text style={styles.tagText}>{task.tag}</Text>
          </View>

          {task.dday && <Text style={styles.dday}>{task.dday}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  description: {
    marginTop: 6,
    marginBottom: 16,
    color: '#888',
    fontSize: 14,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  taskContent: {
    flex: 1,
    marginLeft: 10,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  tagText: {
    marginTop: 4,
    fontSize: 13,
    color: '#7A9B68',
    fontWeight: '700',
  },
  dday: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
});