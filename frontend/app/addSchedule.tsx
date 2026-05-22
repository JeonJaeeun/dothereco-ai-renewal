import {
  addFixedSchedule,
  addFlexibleTask,
  getCategoryStyle
} from '@/storage/scheduleStorage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

type ScheduleType = 'fixed' | 'flexible';
type PlaceMode = 'recommend' | 'fixed' | 'none';

const categories = ['수업', '약속', '심부름', '생활', '운동', '공부', '예약'];
const priorities = ['낮음', '보통', '높음'];
const durations = [30, 60, 90, 120];

const placeModes: { key: PlaceMode; label: string; desc: string }[] = [
  { key: 'recommend', label: '추천 장소형', desc: '카페, 스타벅스, 올리브영처럼 원하는 장소 키워드로 추천해요' },
  { key: 'fixed', label: '고정 장소형', desc: '이미 정해진 장소를 기준으로 배치해요' },
  { key: 'none', label: '장소 없음형', desc: '장소 없이 시간만 배치해요' },
];

export default function AddScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const finalReturnTo =
    typeof params.finalReturnTo === 'string' 
      ? params.finalReturnTo 
      : '/(tabs)/timetable';

  const [scheduleType, setScheduleType] = useState<ScheduleType>('fixed');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('수업');
  const [place, setPlace] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);

  const [duration, setDuration] = useState(60);
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [priority, setPriority] = useState('보통');
  const [placeMode, setPlaceMode] = useState<PlaceMode>('recommend');
  const [placeKeyword, setPlaceKeyword] = useState('');

  useEffect(() => {
    if (typeof params.scheduleType === 'string') {
      setScheduleType(params.scheduleType as ScheduleType);
    }

    if (typeof params.title === 'string') setTitle(params.title);
    if (typeof params.category === 'string') setCategory(params.category);
    if (typeof params.place === 'string') setPlace(params.place);

    if (typeof params.placeKeyword === 'string') {
      setPlaceKeyword(params.placeKeyword);
    }

    if (typeof params.startTime === 'string') {
      setStartTime(new Date(params.startTime));
    }

    if (typeof params.endTime === 'string') {
      setEndTime(new Date(params.endTime));
    }

    if (typeof params.duration === 'string') {
      setDuration(Number(params.duration));
    }

    if (typeof params.deadline === 'string') {
      setDeadline(new Date(params.deadline));
    }

    if (typeof params.priority === 'string') setPriority(params.priority);

    if (typeof params.placeMode === 'string') {
      setPlaceMode(params.placeMode as PlaceMode);
    }

    if (typeof params.selectedPlace === 'string') {
      const parsed = JSON.parse(params.selectedPlace);
      setPlace(parsed.name);
      setSelectedLocation(parsed);
    }
  }, [params.selectedPlace]);

  const formatTime = (date: Date) => {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const goSearchPlace = () => {
    router.push({
      pathname: '/searchPlace',
      params: {
        returnTo: '/addSchedule',
        finalReturnTo,
        target: 'place',

        scheduleType,
        title,
        category,
        place,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: String(duration),
        deadline: deadline.toISOString(),
        priority,
        placeMode,
        placeKeyword,
      },
    });
  };

  const style = getCategoryStyle(category);

  const handleSubmit = async () => {
  if (scheduleType === 'fixed') {
    await addFixedSchedule({
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: formatTime(startTime),
      endTime: formatTime(endTime),
      title,
      place,
      tag: category,
      type: 'fixed',
      color: style.color,
      textColor: style.textColor,

      lat: selectedLocation?.lat,
      lng: selectedLocation?.lng,
    });

    router.replace(finalReturnTo as any);
    return;
  }

  await addFlexibleTask({
    id: Date.now(),
    title,
    selected: false,
    tag: category,
    durationMinutes: duration,
    dday: formatDate(deadline),
    priority,
    placeMode,
    placeKeyword: placeMode === 'recommend' ? placeKeyword : undefined,
    place: placeMode === 'fixed' ? place : undefined,
    completed: false,
    color: style.color,
    textColor: style.textColor,

    lat:selectedLocation?.lat,
    lng: selectedLocation?.lng,
  });

  router.replace(finalReturnTo as any);
};

  const isDisabled =
    scheduleType === 'fixed'
      ? !title.trim() || !place.trim()
      : !title.trim() ||
        (placeMode === 'recommend' && !placeKeyword.trim()) ||
        (placeMode === 'fixed' && !place.trim());

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '일정 추가', headerBackTitle: '뒤로' }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>일정 추가</Text>
        <Text style={styles.subtitle}>
          고정스케줄은 시간과 장소가 정해진 일정이고, 유동스케줄은 추천을 통해 배치할 일이에요.
        </Text>

        <View style={styles.typeTab}>
          <TouchableOpacity
            style={[styles.typeButton, scheduleType === 'fixed' && styles.activeTypeButton]}
            onPress={() => setScheduleType('fixed')}
          >
            <Text style={[styles.typeText, scheduleType === 'fixed' && styles.activeTypeText]}>
              고정스케줄
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, scheduleType === 'flexible' && styles.activeTypeButton]}
            onPress={() => setScheduleType('flexible')}
          >
            <Text style={[styles.typeText, scheduleType === 'flexible' && styles.activeTypeText]}>
              유동스케줄
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {scheduleType === 'fixed' ? '고정스케줄 정보' : '유동스케줄 정보'}
          </Text>

          <Text style={styles.label}>제목</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={scheduleType === 'fixed' ? '예: 컴퓨터네트워크 수업' : '예: 올리브영 들르기'}
            placeholderTextColor="#AAAAAA"
            style={styles.input}
          />

          {scheduleType === 'fixed' ? (
            <>
              <SelectCard
                icon="time-outline"
                label="시작 시간"
                value={formatTime(startTime)}
                onPress={() => setShowTimePicker('start')}
              />

              <SelectCard
                icon="time-outline"
                label="종료 시간"
                value={formatTime(endTime)}
                onPress={() => setShowTimePicker('end')}
              />

              <SelectCard
                icon="location-outline"
                label="장소"
                value={place || '장소 검색하기'}
                isPlaceholder={!place}
                onPress={goSearchPlace}
              />

              <Text style={styles.label}>카테고리</Text>
              <ChipSelector items={categories} value={category} onChange={setCategory} />
            </>
          ) : (
            <>
              <Text style={styles.label}>예상 소요 시간</Text>
              <ChipSelector
                items={durations.map((item) => `${item}분`)}
                value={`${duration}분`}
                onChange={(value) => setDuration(Number(value.replace('분', '')))}
              />

              <SelectCard
                icon="calendar-outline"
                label="마감일"
                value={formatDate(deadline)}
                onPress={() => setShowDatePicker(true)}
              />

              <Text style={styles.label}>중요도</Text>
              <ChipSelector items={priorities} value={priority} onChange={setPriority} />

              <Text style={styles.label}>카테고리</Text>
              <ChipSelector items={categories} value={category} onChange={setCategory} />

              <Text style={styles.label}>장소 선택 방식</Text>
              <View style={styles.placeModeList}>
                {placeModes.map((mode) => (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.placeModeCard,
                      placeMode === mode.key && styles.activePlaceModeCard,
                    ]}
                    onPress={() => setPlaceMode(mode.key)}
                  >
                    <Text
                      style={[
                        styles.placeModeTitle,
                        placeMode === mode.key && styles.activePlaceModeTitle,
                      ]}
                    >
                      {mode.label}
                    </Text>
                    <Text style={styles.placeModeDesc}>{mode.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {placeMode === 'recommend' && (
                <>
                  <Text style={styles.label}>추천 장소 키워드</Text>
                  <TextInput
                    value={placeKeyword}
                    onChangeText={setPlaceKeyword}
                    placeholder="예: 카페, 스타벅스, 올리브영, 도서관"
                    placeholderTextColor="#AAAAAA"
                    style={styles.input}
                  />
                </>
              )}

              {placeMode === 'fixed' && (
                <SelectCard
                  icon="location-outline"
                  label="고정 장소"
                  value={place || '장소 검색하기'}
                  isPlaceholder={!place}
                  onPress={goSearchPlace}
                />
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isDisabled && styles.disabledButton]}
          disabled={isDisabled}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>추가하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {showTimePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={showTimePicker === 'start' ? startTime : endTime}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedDate) => {
              if(!selectedDate) return;
              
              if(showTimePicker === 'start') {
                setStartTime(selectedDate);
              } else {
                setEndTime(selectedDate);
              }
            }}
          />

          <TouchableOpacity
            style={styles.pickerDoneButton}
            onPress={() => setShowTimePicker(null)}
          >
            <Text style={styles.pickerDoneText}>완료</Text>
          </TouchableOpacity>
        </View>
      )}

      {showDatePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={deadline}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedDate) => {
              if(selectedDate) {
                setDeadline(selectedDate);
              }
            }}
          />

          <TouchableOpacity
            style={styles.pickerDoneButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.pickerDoneText}>완료</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function SelectCard({
  icon,
  label,
  value,
  isPlaceholder = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isPlaceholder?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.selectCard} onPress={onPress}>
      <View style={styles.selectIconBox}>
        <Ionicons name={icon} size={22} color="#365C27" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.selectLabel}>{label}</Text>
        <Text style={[styles.selectValue, isPlaceholder && styles.placeholderText]}>
          {value}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
    </TouchableOpacity>
  );
}

function ChipSelector({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.chip, value === item && styles.activeChip]}
          onPress={() => onChange(item)}
        >
          <Text style={[styles.chipText, value === item && styles.activeChipText]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { padding: 24, paddingBottom: 48 },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#4A4A4A',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#777',
    marginBottom: 22,
  },
  typeTab: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 18,
    padding: 5,
    marginBottom: 18,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  activeTypeButton: { backgroundColor: '#2F4F24' },
  typeText: { fontSize: 15, fontWeight: '800', color: '#777' },
  activeTypeText: { color: '#FFFFFF' },
  card: {
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 22,
    padding: 20,
    backgroundColor: '#F8FCF5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4A4A4A',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    color: '#365C27',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8DD',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8DD',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },
  selectIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#888',
  },
  selectValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '900',
    color: '#4A4A4A',
  },
  placeholderText: {
    color: '#AAAAAA',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  activeChip: {
    backgroundColor: '#DFF3D7',
    borderColor: '#6F9A63',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#777',
  },
  activeChipText: {
    color: '#365C27',
  },
  placeModeList: {
    gap: 10,
    marginBottom: 10,
  },
  placeModeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8DD',
    borderRadius: 16,
    padding: 14,
  },
  activePlaceModeCard: {
    borderColor: '#6F9A63',
    backgroundColor: '#F0FAEA',
  },
  placeModeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4A4A4A',
  },
  activePlaceModeTitle: {
    color: '#365C27',
  },
  placeModeDesc: {
    marginTop: 5,
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#DFF3D7',
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#EEEEEE' },
  submitText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2F4F24',
  },
  pickerContainer: {
  marginTop: 10,
  marginBottom: 16,
  backgroundColor: '#FFFFFF',
  borderRadius: 18,
  padding: 12,
  borderWidth: 1,
  borderColor: '#E5E5E5',
  },

  pickerDoneButton: {
    marginTop: 10,
    backgroundColor: '#DFF3D7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  pickerDoneText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#365C27',
  },
});