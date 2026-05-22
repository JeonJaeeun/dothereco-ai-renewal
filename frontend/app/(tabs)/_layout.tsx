import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return(
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2F4F24',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if(route.name === 'timetable') iconName = 'hourglass-outline';
          if(route.name === 'calendar') iconName = 'calendar-outline';
          if(route.name === 'todolist') iconName = 'list-outline';
          if(route.name === 'setting') iconName = 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="timetable" options={{ title: '타임라인' }} />
      <Tabs.Screen name="calendar" options={{ title: '캘린더' }} />
      <Tabs.Screen name="todolist" options={{ title: '할 일' }} />
      <Tabs.Screen name="setting" options={{ title: '설정' }} />
    </Tabs>
  )
}
