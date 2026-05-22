import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  FixedSchedule,
  getFixedSchedules,
} from '@/storage/scheduleStorage';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarScreen() {
  const router = useRouter();
  
  const today = new Date();

  const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const loadSchedules = async () => {
    const data = await getFixedSchedules();
    setFixedSchedules(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [])
  );

  const monthLabel = `${currentYear}년 ${currentMonth + 1}월`;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    const prevBlanks = Array.from({ length: firstDay }, () => null);
    const days = Array.from({ length: lastDate }, (_, i) => i + 1);

    const totalCells = prevBlanks.length + days.length;
    const nextBlanks = Array.from(
      { length: totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7) },
      () => null
    );

    return [...prevBlanks, ...days, ...nextBlanks];
  }, [currentYear, currentMonth]);

  const moveMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentYear((prev) => prev - 1);
        setCurrentMonth(11);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentYear((prev) => prev + 1);
        setCurrentMonth(0);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  };

  const makeDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
  };

  const getSchedulesByDay = (day: number) => {
    return fixedSchedules.filter((schedule) => schedule.date === makeDateString(day));
  };

  const selectedSchedules = fixedSchedules.filter(
    (schedule) => schedule.date === selectedDate
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>캘린더</Text>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/addSchedule',
              params: { finalReturnTo: '/(tabs)/calendar' },
            })
          }
        >
          <Ionicons name="add" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.monthRow}>
          <TouchableOpacity style={styles.arrowButton} onPress={() => moveMonth('prev')}>
            <Ionicons name="chevron-back" size={18} color="#888" />
          </TouchableOpacity>

          <Text style={styles.monthText}>{monthLabel}</Text>

          <TouchableOpacity style={styles.arrowButton} onPress={() => moveMonth('next')}>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dateCell} />;
              }

              const dateString = makeDateString(day);
              const isSelected = selectedDate === dateString;
              const schedules = getSchedulesByDay(day);

              return (
                <TouchableOpacity
                  key={dateString}
                  style={[styles.dateCell, isSelected && styles.selectedCell]}
                  onPress={() => setSelectedDate(dateString)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                    {day}
                  </Text>

                  <View style={styles.miniArea}>
                    {schedules.slice(0, 1).map((schedule) => (
                      <View
                        key={schedule.id}
                        style={[
                          styles.miniPill,
                          { backgroundColor: schedule.color ?? '#DFF3D7'},
                        ]}
                      >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.miniText,
                          { color: schedule.textColor ?? '#365C27' },
                        ]}
                      >
                          {schedule.title}
                        </Text>
                      </View>
                    ))}

                    {schedules.length > 1 && (
                      <Text style={styles.moreText}>+{schedules.length - 1}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>선택한 날짜의 고정스케줄</Text>

        <View style={styles.fixedCard}>
          {selectedSchedules.length > 0 ? (
            selectedSchedules.map((item, index) => (
              <View key={item.id}>
                <View style={styles.fixedItem}>
                  <View style={styles.fixedTextBox}>
                    <Text style={styles.fixedTitle}>{item.title}</Text>
                    <Text style={styles.fixedMeta}>
                      {item.time} · {item.place}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.fixedBadge,
                      { backgroundColor: item.color ?? '#EEEEEE'},
                    ]}
                  >
                    <Text
                      style={[
                        styles.fixedBadgeText,
                        { color: item.textColor ?? '#365C27'},
                      ]}
                    >{item.tag}</Text>
                  </View>
                </View>

                {index !== selectedSchedules.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>등록된 고정스케줄이 없습니다.</Text>
              <Text style={styles.emptySubText}>
                + 버튼으로 고정스케줄을 추가해보세요.
              </Text>
            </View>
          )}
        </View>

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

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    marginBottom: 18,
  },
  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    width: 150,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#4A4A4A',
  },

  calendarCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FAFAFA',
    marginBottom: 24,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: `${100 / 7}%`,
    height: 64,
    borderRadius: 14,
    paddingTop: 6,
    alignItems: 'center',
  },
  selectedCell: {
    backgroundColor: '#E8F5E3',
    borderWidth: 1.5,
    borderColor: '#B7D19D',
  },
  dateText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4A4A4A',
    marginBottom: 4,
  },
  selectedDateText: {
    color: '#365C27',
  },
  miniArea: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  miniPill: {
    maxWidth: 46,
    backgroundColor: '#DFF3D7',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  miniText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#365C27',
  },
  moreText: {
    marginTop: 2,
    fontSize: 8,
    fontWeight: '800',
    color: '#6F9A63',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    color: '#4A4A4A',
  },
  fixedCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
  },
  fixedItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fixedTextBox: {
    flex: 1,
    paddingRight: 12,
  },
  fixedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  fixedMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#777',
  },
  fixedBadge: {
    backgroundColor: '#EEEEEE',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  fixedBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#365C27',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#555',
  },
  emptySubText: {
    marginTop: 6,
    fontSize: 13,
    color: '#999',
  },
});