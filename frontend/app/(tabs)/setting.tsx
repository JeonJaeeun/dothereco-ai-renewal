import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>일정 관리</Text>

          <SettingItem
            icon="pricetag-outline"
            title="카테고리 관리"
            desc="유동스케줄과 고정스케줄 카테고리를 관리해요"
          />

          <SettingItem
            icon="location-outline"
            title="기본 장소 관리"
            desc="집, 학교, 자주 가는 장소를 관리해요"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 설정</Text>

          <SettingItem
            icon="walk-outline"
            title="이동 최소화 기준"
            desc="거리 우선, 시간 우선 기준을 설정해요"
          />

          <SettingItem
            icon="notifications-outline"
            title="알림 설정"
            desc="일정 시작 전 알림을 설정해요"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>

          <SettingItem
            icon="information-circle-outline"
            title="DotheRECO"
            desc="AI 일정 추천 기반 일정 관리 앱"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function SettingItem({
  icon,
  title,
  desc,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
}) {
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={21} color="#365C27" />
      </View>

      <View style={styles.itemTextBox}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#B0B0B0" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  header: {
    paddingTop: 64,
    paddingBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  item: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FCF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  itemTextBox: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  itemDesc: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
});