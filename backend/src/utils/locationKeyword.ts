export function getSearchArea(placeName?: string) {
  if (!placeName) return '';

  const name = placeName.replace(/\s/g, '');

  const areaRules = [
    {
      area: '건대입구',
      keywords: ['건국대', '건국대학교', '건대', '화양동', '자양동'],
    },
    {
      area: '강남역',
      keywords: ['강남', '역삼', '서초', '스타28치과'],
    },
    {
      area: '성수',
      keywords: ['성수', '뚝섬', '서울숲'],
    },
    {
      area: '광진구',
      keywords: ['광진', '구의', '군자', '어린이대공원', '도리스뮤직'],
    },
    {
      area: '잠실',
      keywords: ['잠실', '송파', '석촌'],
    },
    {
      area: '홍대',
      keywords: ['홍대', '상수', '합정', '연남'],
    },
    {
      area: '시청',
      keywords: ['시청', '을지로', '명동', '서울중앙'],
    },
  ];

  const matched = areaRules.find((rule) =>
    rule.keywords.some((keyword) => name.includes(keyword))
  );

  return matched?.area ?? placeName;
}