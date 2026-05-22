import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="input"
        options={{ title: 'AI 추천 요청', headerBackTitle: '뒤로' }}
      />

      <Stack.Screen
        name="result"
        options={{ title: '추천 결과', headerBackTitle: '뒤로' }}
      />

      <Stack.Screen
        name="addSchedule"
        options={{ title: '일정 추가', headerBackTitle: '뒤로' }}
      />
      <Stack.Screen
        name="searchPlace"
        options={{ title: '장소 검색', headerBackTitle: '뒤로' }}
      />
      <Stack.Screen
        name="selectFlexible"
        options={{ title: '유동스케줄 선택', headerBackTitle: '뒤로' }}
      />
    </Stack>
  );
}