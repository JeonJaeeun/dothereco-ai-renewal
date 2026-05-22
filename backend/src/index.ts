import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import OpenAI from 'openai';

import { getSearchArea } from './utils/locationKeyword';

dotenv.config();

const AVERAGE_SPEED_KMH = 30;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

const DAY_START = '09:00';
const DAY_END = '24:00';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   타입
========================= */

type FixedSchedule = {
  id: number;
  date: string;
  time: string;
  endTime?: string;
  title: string;
  place: string;
  tag: string;
  type: 'fixed';

  lat?: number;
  lng?: number;
};

type FlexibleTask = {
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

  lat?: number;
  lng?: number;
};

type RecommendStrategy = {
  prioritizeDeadline: boolean;
  minimizeMovement: boolean;
  preferRest: boolean;
  bufferLevel: 'low' | 'medium' | 'high';
  priorityMode: 'deadline' | 'distance' | 'balanced';
};

/* =========================
   고정스케줄 API
========================= */

// 조회
app.get('/schedules/fixed', async (req, res) => {
  const schedules = await prisma.fixedSchedule.findMany({
    orderBy: { time: 'asc' },
  });

  res.json(schedules);
});

// 추가
app.post('/schedules/fixed', async (req, res) => {
  const newSchedule = await prisma.fixedSchedule.create ({
    data: {
      date: req.body.date,
      time: req.body.time,
      endTime: req.body.endTime,
      title: req.body.title,
      place: req.body.place,
      tag: req.body.tag,
      type: req.body.type ?? 'fixed',
      color: req.body.color,
      textColor: req.body.textColor,
      lat: req.body.lat,
      lng: req.body.lng,
    },
  });

  res.status(201).json(newSchedule);
});

// 수정
app.put('/schedules/fixed/:id', async (req, res) => {
  const id = Number(req.params.id);

  const updated = await prisma.fixedSchedule.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});

// 삭제
app.delete('/schedules/fixed/:id', async (req, res) => {
  const id = Number(req.params.id);

  await prisma.fixedSchedule.delete({
    where: { id },
  });

  res.json({
    success: true,
  });
});

/* =========================
   유동스케줄 API
========================= */

// 조회
app.get('/schedules/flexible', async (req, res) => {
  const tasks = await prisma.flexibleTask.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json(tasks);
});

// 추가
app.post('/schedules/flexible', async (req, res) => {
  const newTask = await prisma.flexibleTask.create({
    data: {
      title: req.body.title,
      selected: req.body.selected ?? false,
      tag: req.body.tag,
      dday: req.body.dday,
      durationMinutes: req.body.durationMinutes,
      priority: req.body.priority,
      placeMode: req.body.placeMode,
      placeKeyword: req.body.placeKeyword,
      place: req.body.place,
      completed: req.body.completed ?? false,
      color: req.body.color,
      textColor: req.body.textColor,
      lat: req.body.lat,
      lng: req.body.lng,
    },
  });

  res.status(201).json(newTask);
});

// 수정
app.put('/schedules/flexible/:id', async (req, res) => {
  const id = Number(req.params.id);

  const updated = await prisma.flexibleTask.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});

// 삭제
app.delete('/schedules/flexible/:id', async (req, res) => {
  const id = Number(req.params.id);

  await prisma.flexibleTask.delete({
    where: { id },
  });

  res.json({
    success: true,
  });
});

/* =========================
   장소 검색 API (더미)
========================= */

app.get('/places/search', async (req, res) => {
  const query = String(req.query.query ?? '').trim();

  if (!query) {
    return res.json({ places: [] });
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
      )}&display=10&start=1&sort=random`,
      {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID ?? '',
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET ?? '',
        },
      }
    );

    const data = await response.json();

    const places = (data.items ?? []).map((item: any) => ({
      name: item.title.replace(/<[^>]*>/g, ''),
      category: item.category,
      address: item.roadAddress || item.address,
      lat: Number(item.mapy) / 10000000,
      lng: Number(item.mapx) / 10000000,
    }));

    res.json({ places });
  } catch (error) {
    console.error('장소 검색 실패:', error);
    res.status(500).json({ message: '장소 검색 실패' });
  }
});

/* =========================
   추천 API
========================= */

function parseDday(dday?: string) {
  if(!dday) return 999;
  if(dday.toLowerCase() === 'd-day') return 0;

  const match = dday.match(/D-(\d+)/i);
  return match ? Number(match[1]) : 999;
}

function getPriorityScore(priority?: string | number) {
  if(priority === '높음') return 30;
  if(priority === '보통') return 20;
  if(priority === '낮음') return 10;
  if(typeof priority === 'number') return priority * 10;
  return 10;
}

function getDeadlineScore(dday?: string) {
  const days = parseDday(dday);

  if(days === 0) return 40;
  if(days === 1) return 30;
  if(days <= 3) return 20;
  if(days <= 7) return 10;
  return 0;
}

function getDurationScore(durationMinutes?: number) {
  if(!durationMinutes) return 0;

  if(durationMinutes <= 30) return 15;
  if(durationMinutes <= 60) return 10;
  if(durationMinutes <= 90) return 5;
  return 0;
}

function getTaskScore(task: FlexibleTask) {
  return (
    getDeadlineScore(task.dday) +
    getPriorityScore(task.priority) +
    getDurationScore(task.durationMinutes)
  );
}

function getTaskScoreByStrategy(task: FlexibleTask, strategy: RecommendStrategy) {
  let score = getTaskScore(task);

  if (strategy.prioritizeDeadline || strategy.priorityMode === 'deadline') {
    score += getDeadlineScore(task.dday) * 2;
  }

  if (strategy.preferRest) {
    const duration = task.durationMinutes ?? 60;

    if (duration <= 60) score += 10;
    if (duration >= 120) score -= 10;
  }

  return score;
}

function sortTasksByScore(tasks: FlexibleTask[], strategy: RecommendStrategy) {
  return [...tasks].sort(
    (a, b) =>
      getTaskScoreByStrategy(b, strategy) -
      getTaskScoreByStrategy(a, strategy)
  );
}

function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function estimateMoveMinutes(distanceKm: number){
  return (distanceKm / AVERAGE_SPEED_KMH) * 60;
}

async function searchPlaces(query: string){
  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
          query
        )}&display=20&start=1&sort=random`,
        {
          headers: {
            'X-Naver-Client-Id':
              process.env.NAVER_CLIENT_ID ?? '',
            'X-Naver-Client-Secret':
              process.env.NAVER_CLIENT_SECRET ?? '',
          },
        }
      );
      
      const data = await response.json();

      return (data.items ?? []).map((item: any) => ({
        name: item.title.replace(/<[^>]*>/g, ''),
        address: item.roadAddress || item.address,
        lat: Number(item.mapy) / 10000000,
        lng: Number(item.mapx) / 10000000,
      }));
  } catch (error){
    console.error('장소 검색 실패', error);
    return [];
  }
}

async function findBestPlace(
  keyword: string,
  previousPlace: any,
  nextPlace: any,
  durationMinutes: number,
  availableMinutes: number,
  bufferMinutes: number
) {
  const candidates = await searchPlaces(keyword);

  console.log(
    '검색어:',
    keyword,
    candidates.map((p: any) => p.name)
  );

  // console.log('검색 후보: ', keyword, candidates.map((p: any) => p.name));

  let bestPlace: any = null;
  let bestMoveMinutes = Infinity;

  for (const candidate of candidates) {
    const distanceFromPrevious = calculateDistanceKm(
      previousPlace.lat,
      previousPlace.lng,
      candidate.lat,
      candidate.lng
    );

    const distanceToNext = calculateDistanceKm(
      candidate.lat,
      candidate.lng,
      nextPlace.lat,
      nextPlace.lng
    );

    const moveMinutesFromPrevious = estimateMoveMinutes(distanceFromPrevious);
    const moveMinutesToNext = estimateMoveMinutes(distanceToNext);

    const totalMoveMinutes = moveMinutesFromPrevious + moveMinutesToNext;

    const distanceScore =
      distanceFromPrevious < 1
        ? -30
        : distanceFromPrevious < 3
          ? -15
          : 0;

    const totalRequiredMinutes =
      totalMoveMinutes + durationMinutes + bufferMinutes;

    if (totalRequiredMinutes > availableMinutes) {
      continue;
    }

    const finalScore =
      totalMoveMinutes + distanceScore;

    if (finalScore < bestMoveMinutes) {
      bestMoveMinutes = finalScore;

      bestPlace = {
        ...candidate,
        beforeMoveMinutes: Math.round(moveMinutesFromPrevious),
        afterMoveMinutes: Math.round(moveMinutesToNext),
        moveMinutes: Math.round(totalMoveMinutes),
        totalRequiredMinutes: Math.round(totalRequiredMinutes),
      };
    }
  }

  return bestPlace;
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function roundUpToNext30(minutes: number) {
  return Math.ceil(minutes / 30) * 30;
}

type FreeSlot = {
  start: number;
  end: number;
  duration: number;
  label: string;
};

function getFreeSlots(fixedSchedules: any[]) {
  const sorted = [...fixedSchedules].sort((a,b) =>
    a.time.localeCompare(b.time)
  );

  const slots: FreeSlot[] = [];

  const dayStart = timeToMinutes(DAY_START);
  const dayEnd = timeToMinutes(DAY_END);

  if(sorted.length === 0) {
    return [
      { 
        start: dayStart, 
        end: dayEnd, 
        duration: dayEnd - dayStart,
        label: `${DAY_START}~${DAY_END}`,
      },
    ];
  }

  const firstStart = timeToMinutes(sorted[0].time);

  if(firstStart - dayStart >= 30) {
    slots.push({
      start: dayStart,
      end: firstStart,
      duration: firstStart - dayStart,
      label: `${DAY_START}~${sorted[0].time}`,
    });
  }

  for(let i = 0; i < sorted.length - 1; i++){
    const currentEnd = timeToMinutes(sorted[i].endTime ?? sorted[i].time);
    const nextStart = timeToMinutes(sorted[i+1].time);

    const gap = nextStart - currentEnd;

    if(gap >= 30) {
      slots.push({
        start: currentEnd,
        end: nextStart,
        duration: gap,
        label: `${minutesToTime(currentEnd)}~${minutesToTime(nextStart)}`,
      });
    }
  }

  const lastEnd = timeToMinutes(
    sorted[sorted.length - 1].endTime ?? sorted[sorted.length - 1].time
  );

  if(dayEnd - lastEnd >= 30) {
    slots.push({
      start: lastEnd,
      end: dayEnd,
      duration: dayEnd - lastEnd,
      label: `${minutesToTime(lastEnd)}~${DAY_END}`,
    });
  }

  return slots;
}

function placeTasksInFreeSlots(tasks: FlexibleTask[], freeSlots: any[]) {
  const placedTasks = [];
  const slots = freeSlots.map((slot) => ({...slot}));

  for(const task of tasks) {
    const duration = task.durationMinutes ?? 60;

    const availableSlot = slots.find(
      (slot) => slot.end - slot.start >= duration
    );

    if(!availableSlot) continue;

    const startTime = availableSlot.start;
    const endTime = startTime + duration;

    placedTasks.push({
      ...task,
      time: minutesToTime(startTime),
      endTime: minutesToTime(endTime),
    });

    availableSlot.start = endTime + 20;
  }

  return placedTasks;
}

function getSearchKeyword(title: string) {
  return title
    .replace('들르기', '')
    .replace('가기', '')
    .replace('장보기', '')
    .replace('하기', '')
    .trim();
}

async function analyzeUserRequest(
  userRequest: string
): Promise<RecommendStrategy> {
  if (!userRequest.trim()) {
    return {
      prioritizeDeadline: false,
      minimizeMovement: false,
      preferRest: false,
      bufferLevel: 'medium',
      priorityMode: 'balanced',
    };
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1-nano',
      input: `
사용자의 일정 추천 요청을 아래 JSON 형식으로만 변환해줘.

요청: "${userRequest}"

반드시 JSON만 반환:
{
  "prioritizeDeadline": boolean,
  "minimizeMovement": boolean,
  "preferRest": boolean,
  "bufferLevel": "low" | "medium" | "high",
  "priorityMode": "deadline" | "distance" | "balanced"
}
`,
    });

    return JSON.parse(response.output_text);
  } catch (error) {
    console.error('AI 요청 해석 실패:', error);

    return {
      prioritizeDeadline: false,
      minimizeMovement: false,
      preferRest: false,
      bufferLevel: 'medium',
      priorityMode: 'balanced',
    };
  }
}

app.post('/recommend', async (req, res) => {
  try{
    const body = req.body ?? {};

    const {
      userRequest = '',
      selectedTasks = [],
      fixedSchedules: requestFixedSchedules = [],
    } = body;

    const strategy = await analyzeUserRequest(userRequest);

    console.log('AI 전략: ', strategy);

    console.log('백엔드 req.body:', req.body);
    console.log('백엔드 selectedTasks:', selectedTasks);
    console.log('백엔드 fixedSchedules:', requestFixedSchedules);

    const bufferMinutes =
      strategy.bufferLevel === 'high'
        ? 20
        : strategy.bufferLevel === 'low'
          ? 5
          : 10

    const dbFixedSchedules = await prisma.fixedSchedule.findMany({
      orderBy: { time: 'asc' },
    });

    const activeFixedSchedules =
      requestFixedSchedules.length > 0
        ? requestFixedSchedules
        : dbFixedSchedules;

    const sortedFixedSchedules = [...activeFixedSchedules].sort(
      (a: any, b: any) => a.time.localeCompare(b.time)
    );

  let sortedTasks = sortTasksByScore(selectedTasks, strategy);
  console.log('selectedTasks: ', selectedTasks);
  console.log('strategy: ', strategy);

  if(strategy.preferRest && sortedTasks.length > 3){
    sortedTasks = sortedTasks.slice(0, 3);
  }

  const freeSlots = getFreeSlots(sortedFixedSchedules);

  const flexibleTimeline: any[] = [];
  const unplacedTasks: any[] = [];
  const placementReasons: string[] = [];

  const remainingTasks = [...sortedTasks];

for (const slot of freeSlots) {
  let currentPlace: any = null;

  const previousFixed = [...sortedFixedSchedules]
    .reverse()
    .find(
      (schedule: any) =>
        timeToMinutes(schedule.endTime ?? schedule.time) <= slot.start
    );

  const nextFixed = sortedFixedSchedules.find(
    (schedule: any) => timeToMinutes(schedule.time) >= slot.end
  );

  if (!previousFixed || !nextFixed) continue;

  currentPlace = previousFixed;

  while (remainingTasks.length > 0) {
    const availableMinutes = slot.end - slot.start;

    let bestCandidate: any = null;
    let bestCandidateIndex = -1;
    let bestSelectedPlace: any = null;
    let bestStartTime = 0;
    let bestEndTime = 0;
    let bestMoveMinutes = Infinity;

    for (let i = 0; i < remainingTasks.length; i++) {
      const task = remainingTasks[i];
      const duration = task.durationMinutes ?? 60;

      if (
        currentPlace.lat == null ||
        currentPlace.lng == null ||
        nextFixed.lat == null ||
        nextFixed.lng == null
      ) {
        continue;
      }

      let selectedPlace: any = null;

      if (task.placeMode === 'fixed' && task.lat && task.lng) {
        const distanceFromCurrent = calculateDistanceKm(
          currentPlace.lat,
          currentPlace.lng,
          task.lat,
          task.lng
        );

        const distanceToNext = calculateDistanceKm(
          task.lat,
          task.lng,
          nextFixed.lat,
          nextFixed.lng
        );

        const moveMinutesFromCurrent = estimateMoveMinutes(distanceFromCurrent);
        const moveMinutesToNext = estimateMoveMinutes(distanceToNext);

        selectedPlace = {
          name: task.place ?? '고정 장소',
          lat: task.lat,
          lng: task.lng,
          beforeMoveMinutes: Math.round(moveMinutesFromCurrent),
          afterMoveMinutes: Math.round(moveMinutesToNext),
          moveMinutes: Math.round(moveMinutesFromCurrent + moveMinutesToNext),
        };
      } else if (task.placeMode === 'none') {
        selectedPlace = {
          name: '장소 없음',
          lat: currentPlace.lat,
          lng: currentPlace.lng,
          moveMinutes: 0,
        };
      } else {
        const baseKeyword =
          task.placeKeyword || getSearchKeyword(task.title);

        const searchArea = getSearchArea(currentPlace.place);

        const searchKeyword =
          searchArea
            ? `${searchArea} ${baseKeyword}`
            : baseKeyword;

        selectedPlace = await findBestPlace(
          searchKeyword,
          currentPlace,
          nextFixed,
          duration,
          availableMinutes,
          bufferMinutes
        );
      }

      if (!selectedPlace) continue;

      const startTime = roundUpToNext30(
        slot.start + (selectedPlace.beforeMoveMinutes ?? 0)
      );

      const endTime = startTime + duration;

      const finalArrivalTime =
        endTime + (selectedPlace.afterMoveMinutes ?? 0) + bufferMinutes;

      if (finalArrivalTime > slot.end) continue;

      const score =
        strategy.minimizeMovement || strategy.priorityMode === 'distance'
          ? selectedPlace.beforeMoveMinutes ?? selectedPlace.moveMinutes ?? 9999
          : selectedPlace.moveMinutes ?? 9999;

      if (score < bestMoveMinutes) {
        bestMoveMinutes = score;
        bestCandidate = task;
        bestCandidateIndex = i;
        bestSelectedPlace = selectedPlace;
        bestStartTime = startTime;
        bestEndTime = endTime;
      }
    }

    if (!bestCandidate || !bestSelectedPlace) {

      console.log('이 슬롯에서 배치 실패:', {
        slot: slot.label,
        slotStart: minutesToTime(slot.start),
        slotEnd: minutesToTime(slot.end),
        remainingTasks: remainingTasks.map((task) => task.title),
        currentPlace,
        nextFixed,
      });

      break;
    }

    flexibleTimeline.push({
      id: 100 + flexibleTimeline.length,
      time: minutesToTime(bestStartTime),
      endTime: minutesToTime(bestEndTime),
      title: bestCandidate.title,
      place: bestSelectedPlace.name,
      tag: bestCandidate.tag,
      type: 'flexible',
      durationMinutes: bestCandidate.durationMinutes,
      priority: bestCandidate.priority,
      dday: bestCandidate.dday,
      moveMinutes: bestSelectedPlace.moveMinutes,
    });

    placementReasons.push(
      `${bestCandidate.title}은 ${slot.label} 빈 시간에 배치했어요. 이동시간 약 ${
        bestSelectedPlace.moveMinutes ?? 0
      }분과 소요시간 ${bestCandidate.durationMinutes ?? 60}분을 고려했어요.`
    );

    slot.start = roundUpToNext30(bestEndTime + bufferMinutes);

    currentPlace = {
      lat: bestSelectedPlace.lat,
      lng: bestSelectedPlace.lng,
      place: bestSelectedPlace.name,
    };

    remainingTasks.splice(bestCandidateIndex, 1);
  }
}

for (const task of remainingTasks) {
  unplacedTasks.push({
    ...task,
    reason:
      '빈 시간, 이동시간, 예상 소요시간을 함께 고려했을 때 배치 가능한 시간이 부족했어요.',
  });
}

    const fixedTimeline = sortedFixedSchedules.map(
      (schedule: any) => ({
        id: schedule.id,
        time: schedule.time,
        endTime: schedule.endTime,
        title: schedule.title,
        place: schedule.place,
        tag: schedule.tag,
        type: 'fixed',
      })
    );

    const timeline = [
      ...fixedTimeline,
      ...flexibleTimeline,
    ].sort((a, b) => a.time.localeCompare(b.time));

    const reasons = [
    '고정 일정 사이의 빈 시간을 활용했어요.',
    '이동시간과 예상 소요시간을 함께 계산했어요.',
    ];

    if (strategy.minimizeMovement) {
    reasons.push('이동이 적은 동선을 우선으로 고려했어요.');
    }

    if (strategy.preferRest) {
      reasons.push('피로도를 고려해 여유 시간을 더 확보했어요.');
    }

    if (strategy.prioritizeDeadline || strategy.priorityMode === 'deadline') {
      reasons.push('마감일이 가까운 일정을 우선 배치했어요.');
    }

    if (userRequest) {
      reasons.push(`사용자 요청 "${userRequest}"를 반영했어요.`);
    }

    if (sortedTasks.some((task) => task.priority === '높음')) {
      reasons.push('중요도가 높은 일정부터 우선 배치했어요.');
    }

    if (unplacedTasks.length > 0) {
      reasons.push(
        `${unplacedTasks.length}개의 일정은 시간 부족으로 배치하지 못했어요.`
      );
    }

    const responseData = {
      summary:
        unplacedTasks.length > 0
        ? '일부 일정은 시간 또는 이동 조건 때문에 배치하지 못했어요.'
        : '선택한 일정을 고정스케줄 사이에 무리 없이 배치했어요.',

      strategy: '빈 시간 + 이동시간 + 예상 소요시간 기반 추천',

      aiStrategy: strategy,

      reasons,
      reflectedTasks: selectedTasks,
      unplacedTasks,
      timeline,
    };

    await prisma.recommendation.create({
      data: {
        request: userRequest,
        strategy: responseData.strategy,
        summary: responseData.summary,
        reasons: JSON.stringify(responseData.reasons),
        timeline: JSON.stringify(responseData.timeline),
      },
    });

    res.json(responseData);
} catch(error) {
  console.error('추천 API 실패: ', error);

  res.status(500).json({
    message: '추천 API 실패',
    error: error instanceof Error ? error.message : String(error),
  });
}

});

/* =========================
   서버 시작
========================= */

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});