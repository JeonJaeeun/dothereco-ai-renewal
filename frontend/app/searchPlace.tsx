import { API_BASE_URL } from '@/api/config';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const quickKeywords = ['학교', '강남역', '올리브영', '마트', '헬스장', '카페'];

export default function SearchPlaceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { returnTo, target } = params;

  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null >(null);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if(status !== 'granted') {
          console.log('위치 권한 거부');
          return;
        }

        const location =
          await Location.getCurrentPositionAsync({});

        setCurrentLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch(error) {
        console.error('현재 위치 가져오기 실패', error);
      }
    };

    getCurrentLocation();
  }, []);
  
  useEffect(() => {
    const fetchPlaces = async () => {
      if(!keyword.trim()) {
        setPlaces([]);
        return;
      }

      try{
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/places/search?query=${encodeURIComponent(
            keyword
          )}`
        );

        const result = await response.json();

        const placesWithDistance = (result.places ?? []).map(
          (place: any) => {
            /*
            console.log('현재 위치: ', currentLocation);

            console.log(
              '검색 장소: ',
              place.name,
              place.lat,
              place.lng
            );
            */
           
            let distance = null;

            if (currentLocation) {
              distance = calculateDistance(
                currentLocation.lat,
                currentLocation.lng,
                place.lat,
                place.lng
              );
            }

            return {
              ...place,
              distance,
            };
          }
        );

        placesWithDistance.sort((a: any, b: any) => {
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;

          return a.distance - b.distance;
        });

        setPlaces(placesWithDistance);
      } catch(error){
        console.error('장소 검색 실패', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPlaces();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
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

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleSelect = (place: any) => {
    router.replace({
      pathname: (typeof returnTo === 'string' ? returnTo : '/addSchedule') as any,
      params: {
        ...params,
        selectedPlace: JSON.stringify(place),
        target: typeof target === 'string' ? target : 'place',
      },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '장소 검색', headerBackTitle: '뒤로' }} />

      <Text style={styles.title}>장소 검색</Text>
      <Text style={styles.subtitle}>
        장소를 검색해서 선택할 수 있어요.
      </Text>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={22} color="#8A8A8A" />

        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="예: 올리브영, 강남역, 헬스장"
          placeholderTextColor="#AAAAAA"
          style={styles.input}
        />

        {keyword.length > 0 && (
          <TouchableOpacity onPress={() => setKeyword('')}>
            <Ionicons name="close-circle" size={22} color="#B0B0B0" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickRow}>
        {quickKeywords.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.quickChip}
            onPress={() => setKeyword(item)}
          >
            <Text style={styles.quickChipText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          {keyword.trim() ? '검색 결과' : '추천 장소'}
        </Text>

        {loading ? (
          <Text style={styles.loadingText}>
            장소 검색 중 ...
          </Text>
        ) : places.length > 0 ? (
          places.map((place) => (
            <TouchableOpacity
              key={place.name}
              style={styles.placeCard}
              onPress={() => handleSelect(place)}
            >
              <View style={styles.iconBox}>
                <Ionicons name="location-outline" size={22} color="#365C27" />
              </View>

              <View style={styles.placeContent}>
                <View style={styles.placeHeader}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{place.category}</Text>
                  </View>
                </View>

                {place.distance != null && (
                  <Text style={styles.distance}>
                    약 {place.distance.toFixed(1)}km
                  </Text>
                )}
                <Text style={styles.coordinate}>
                  lat {place.lat} · lng {place.lng}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              검색 결과가 없어요.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginTop: 32,
    fontSize: 30,
    fontWeight: '900',
    color: '#4A4A4A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#777',
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCF5',
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#4A4A4A',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEAD3',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#365C27',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8DD',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeContent: {
    flex: 1,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  placeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#4A4A4A',
  },
  categoryBadge: {
    backgroundColor: '#DFF3D7',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#365C27',
  },
  distance: {
    marginTop: 6,
    fontSize: 13,
    color: '#365C27',
    fontWeight: '700',
  },
  coordinate: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  loadingText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#777',
    fontSize: 15,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});