import { StyleSheet, Text, View } from 'react-native';

type TimeBlock = {
  id: number;
  time: string;
  title: string;
  place: string;
  tag: string;
  type: 'fixed' | 'flexible';
};

type Props = {
  timeBlocks: TimeBlock[];
};

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function TimeLineCard({ timeBlocks }: Props) {
  const sortedBlocks = [...timeBlocks].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  const nowMinutes = getCurrentMinutes();

  const nowIndex = sortedBlocks.findIndex((block, index) => {
    const current = timeToMinutes(block.time);
    const next = sortedBlocks[index + 1]
      ? timeToMinutes(sortedBlocks[index + 1].time)
      : current + 180;

    return nowMinutes >= current && nowMinutes < next;
  });

  return (
    <View style={styles.container}>
      {sortedBlocks.map((block, index) => {
        const isNowHere = index === nowIndex;

        return (
          <View key={block.id}>
            <View style={styles.row}>
              <Text style={styles.time}>{block.time}</Text>

              <View style={styles.lineArea}>
                <View
                  style={[
                    styles.dot,
                    block.type === 'flexible' && styles.flexibleDot,
                  ]}
                />
                {index !== sortedBlocks.length - 1 && <View style={styles.line} />}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{block.title}</Text>
                  <View
                    style={[
                      styles.badge,
                      block.type === 'fixed' ? styles.fixedBadge : styles.flexBadge,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {block.type === 'fixed' ? '고정' : '유동'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.place}>{block.place}</Text>
                <Text style={styles.tag}>{block.tag}</Text>
              </View>
            </View>

            {isNowHere && (
              <View style={styles.nowRow}>
                <Text style={styles.nowLabel}>현재</Text>
                <View style={styles.nowDot} />
                <View style={styles.nowLine} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
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
  flexibleDot: {
    backgroundColor: '#6F9A63',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#DCEAD3',
    marginTop: 2,
  },
  card: {
    flex: 1,
    backgroundColor: '#F8FCF5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCEAD3',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  place: {
    marginTop: 8,
    fontSize: 14,
    color: '#777',
  },
  tag: {
    marginTop: 8,
    fontSize: 13,
    color: '#6F9A63',
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fixedBadge: {
    backgroundColor: '#EEEEEE',
  },
  flexBadge: {
    backgroundColor: '#DFF3D7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#365C27',
  },
  nowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  nowLabel: {
    width: 60,
    fontSize: 13,
    fontWeight: '900',
    color: '#E05656',
  },
  nowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E05656',
    marginRight: 8,
  },
  nowLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E05656',
  },
});