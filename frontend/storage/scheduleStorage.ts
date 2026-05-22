import AsyncStorage from '@react-native-async-storage/async-storage';

export type FlexibleTask = {
  id: number;
  title: string;
  selected?: boolean;
  tag: string;
  dday?: string;
  durationMinutes?: number;
  priority?: string | number;
  placeMode?: 'recommend' | 'fixed' | 'none';
  placeKeyword?: string;
  place?: string;
  completed?: boolean;
  
  color?: string;
  textColor?: string;

  lat?: number;
  lng?: number;
};

export type FixedSchedule = {
  id: number;
  date: string;
  time: string;
  endTime?: string;
  title: string;
  place: string;
  tag: string;
  type: 'fixed';

  color?: string;
  textColor?: string;

  lat?: number;
  lng?: number;
};

const FLEXIBLE_KEY = 'DOTHERECO_FLEXIBLE_TASKS';
const FIXED_KEY = 'DOTHERECO_FIXED_SCHEDULES';

export async function getFlexibleTasks(): Promise<FlexibleTask[]> {
  const data = await AsyncStorage.getItem(FLEXIBLE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveFlexibleTasks(tasks: FlexibleTask[]) {
  await AsyncStorage.setItem(FLEXIBLE_KEY, JSON.stringify(tasks));
}

export async function addFlexibleTask(task: FlexibleTask) {
  const current = await getFlexibleTasks();
  await saveFlexibleTasks([...current, task]);
}

export async function getFixedSchedules(): Promise<FixedSchedule[]> {
  const data = await AsyncStorage.getItem(FIXED_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveFixedSchedules(schedules: FixedSchedule[]) {
  await AsyncStorage.setItem(FIXED_KEY, JSON.stringify(schedules));
}

export async function addFixedSchedule(schedule: FixedSchedule) {
  const current = await getFixedSchedules();
  await saveFixedSchedules([...current, schedule]);
}

export function getCategoryStyle(tag: string) {
  const styles: Record<string, { color: string; textColor: string }> = {
    수업: { color: '#DDF7F2', textColor: '#1F8A70' },
    약속: { color: '#FFE8D9', textColor: '#D97706' },
    예약: { color: '#E2EEFF', textColor: '#3979C6' },
    취업: { color: '#F2E7FF', textColor: '#8B5CF6' },
    운동: { color: '#DCFCE7', textColor: '#16A34A' },
    공부: { color: '#FDECC8', textColor: '#C0841A' },
    생활: { color: '#E2EEFF', textColor: '#3979C6' },
    심부름: { color: '#FFE8D9', textColor: '#D97706' },
  };

  return styles[tag] ?? { color: '#DFF3D7', textColor: '#365C27' };
}

export async function clearSchedules() {
  await AsyncStorage.clear();
}