import { StyleSheet, Text, View } from 'react-native';

export default function DateSelector() {
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      key: index,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: date.getDate(),
      isToday: index === 0,
    };
  });

  return (
    <View>
      <View style={styles.dateRow}>
        {days.map((item) => (
          <View key={item.key} style={styles.dateItem}>
            <Text style={[styles.dayText, item.isToday && styles.activeDayText]}>
              {item.day}
            </Text>
            <View style={[styles.dateCircle, item.isToday && styles.activeDateCircle]}>
              <Text style={[styles.dateText, item.isToday && styles.activeDateText]}>
                {item.date}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  dateItem: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    color: '#B0B0B0',
    fontWeight: '700',
    marginBottom: 8,
  },
  activeDayText: {
    color: '#365C27',
  },
  dateCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDateCircle: {
    backgroundColor: '#111',
    borderColor: '#365C27',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#999',
  },
  activeDateText: {
    color: '#FFFFFF',
  },
});