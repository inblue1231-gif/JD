// =============================================================
// 같은 자리, 달라진 만족 — 콘서트 데이터
// BOYNEXTDOOR KNOCK ON Vol.2 IN SEOUL / 2026.07.19 / KSPO DOME
//
// 출처
//  - 시각: 직접 찍은 영상 50개의 촬영 기록(videos.csv) + 이벤트 맵 메모
//  - SEE / PLAY / 만족도: 포스터의 자기평가 (구간 단위)
//  - 세트리스트: 당일 세트리스트 + 직접 확인한 사운드체크·노래방·추가 앵콜 곡
//
// approx: true 인 시각은 기억 기반의 추정치. 화면에 "약"으로 표시할 것.
// 곡별 정확한 시작 시각은 기록이 없음 → 구간 안에서 순서대로 배치 (기준점: M1 17:03, M23 19:26)
// =============================================================

window.CONCERT = {
  meta: {
    artist: "BOYNEXTDOOR",
    tour: "KNOCK ON Vol.2 IN SEOUL",
    date: "2026.07.19",
    day: "DAY 3 (막콘)",
    venue: "KSPO DOME",
    seat: "F2 펜스 1열",
    entryNumber: 16,
    dayStart: "13:00",
    dayEnd: "20:00",
  },

  // 점수 척도: SEE 0~5, PLAY 0~5, 만족도 1~5 (포스터 기준)
  // null = 포스터 평가 범위 밖 (화면에 "—")
  segments: [
    {
      id: "arrive",
      name: "도착",
      nameEn: "ARRIVAL",
      start: "13:00",
      end: "14:15",
      see: null,
      play: null,
      satisfaction: null,
      hand: null,
      crowd: "outside",
      note: "KSPO DOME 도착, 스탠딩 대기 장소로 이동",
    },
    {
      id: "entry",
      name: "입장",
      nameEn: "ENTRY",
      start: "14:15",
      end: "15:00",
      see: null,
      play: null,
      satisfaction: null,
      hand: null,
      crowd: "settling",
      note: "한 줄 입장, F2 펜스 1열 확보",
    },
    {
      id: "soundcheck",
      name: "사운드체크",
      nameEn: "SOUNDCHECK",
      start: "15:00",
      end: "15:19",
      see: 5,
      play: 1,
      satisfaction: 3,
      hand: "lightstick-gentle", // 응원봉을 들고 있음 (20분 중 약 60%는 촬영)
      crowd: "still", // 거의 움직이지 않고 무대를 봄
      filmingRatio: 0.6,
      videoCount: 12,
      note: "가까이 봤지만 짧았음. 추가 비용과 긴 대기가 아쉬움",
      songs: ["오늘만 I LOVE YOU", "Hollywood Action", "ADIOS!"],
    },
    {
      id: "wait",
      name: "대기",
      nameEn: "WAITING",
      start: "15:19",
      end: "17:00",
      see: 0, // 아티스트 미등장 (불만족이 아니라 관람 대상의 부재)
      play: 2,
      satisfaction: 3,
      hand: "badge", // 캔뱃지 나눔 / 스케치북 멘트 작성
      crowd: "facing-each-other", // 무대 대신 서로를 향함 (대화, 나눔)
      filmingRatio: 0,
      videoCount: 0,
      note: "팬들과의 시간은 좋았지만 다시 기다리고 싶지는 않음",
      songs: [],
    },
    {
      id: "main",
      name: "본공연",
      nameEn: "MAIN SHOW",
      start: "17:00",
      end: "19:15",
      endApprox: true,
      see: 5,
      play: 3,
      satisfaction: 5,
      hand: "lightstick-gentle", // 응원봉 잔잔하게, 가끔 휴대폰
      crowd: "sway",
      filmingRatio: 0.21,
      videoCount: 28,
      note: "노래와 뛰기는 자제했지만 무대 관람에는 매우 만족",
      songs: [
        { type: "vcr", title: "OPENING VCR" },
        { no: "M1", title: "06070", time: "17:03" },
        { no: "M2", title: "VIRAL" },
        { no: "M3", title: "뭣 같아 (But Sometimes)" },
        { no: "M4", title: "I Feel Good" },
        { type: "mc", title: "OPENING MENT" },
        { no: "M5", title: "123-78" },
        { no: "M6", title: "오늘만 I LOVE YOU (IF I SAY, I LOVE YOU)" },
        { type: "vcr", title: "VCR" },
        { no: "M7", title: "Live In Paris" },
        { no: "M8", title: "장난쳐? (Is That True?)" },
        { no: "M9", title: "So let's go see the stars" },
        { type: "mc", title: "MC" },
        { no: "M10", title: "기억해줘요 (Forever You)" },
        { no: "M11", title: "Call Me" },
        { type: "vcr", title: "VCR" },
        { no: "M12", title: "Hollywood Action" },
        { no: "M13", title: "Upside Down" },
        { no: "M14", title: "Nice Guy" },
        { no: "M15", title: "Earth, Wind & Fire" },
        { type: "band", title: "BANDNEXTDOOR" },
        { type: "vcr", title: "VCR" },
        { no: "M16", title: "똑똑똑 (ddok ddok ddok)" },
        { no: "M17", title: "One and Only" },
        { no: "M18", title: "JAM!" },
        { no: "M19", title: "Bathroom" },
        { no: "M20", title: "부모님 관람불가 (Dangerous)" },
        { type: "mc", title: "ENDING MENT" },
        { no: "M21", title: "돌멩이 (Gonna Be A Rock)" },
        { no: "M22", title: "ADIOS!" },
      ],
    },
    {
      id: "karaoke",
      name: "노래방",
      nameEn: "KARAOKE",
      start: "19:15",
      end: "19:26",
      startApprox: true,
      see: 0, // 아티스트 미등장, 전광판에 노래방 화면(가사 + MV)
      play: 5,
      satisfaction: 4,
      hand: "lightstick-big",
      crowd: "singing", // 크게 흔들며 함께 들썩임 (떼창)
      filmingRatio: 0,
      videoCount: 0,
      note: "마음껏 노래해 즐거웠음. 아티스트가 없는 아쉬움",
      screen: "karaoke", // 전광판이 노래방 화면으로 바뀜
      songs: [
        { no: "001", title: "돌아버리겠다 (But I Like You)" },
        { no: "002", title: "Earth, Wind & Fire" },
      ],
    },
    {
      id: "encore",
      name: "앵콜",
      nameEn: "ENCORE",
      start: "19:26",
      end: "20:00",
      see: 5,
      play: 5,
      satisfaction: 5,
      hand: "lightstick-jump", // 휴대폰 내려놓고 뜀
      crowd: "jump",
      filmingRatio: 0.16,
      videoCount: 10,
      note: "아티스트를 보면서 원하는 만큼 함께 뛰어놂",
      // 19:26~19:48: 대부분 뛰고, 기억에 남는 순간만 골라 촬영
      // 19:48~20:00: 촬영 0개 (기억 기반, approx)
      memorableShots: [
        "아래에서 올려다보면 뒤에서 조명이 비춰 멤버가 빛나 보임 (역광)",
        "멤버가 펜스 가까이 와줌",
        "물 뿌려줌",
      ],
      songs: [
        { part: "Encore", no: "M23", title: "이렇게 좋아해 본 적이 없어요 (Never Loved This Way Before)", time: "19:26" },
        { part: "Encore", no: "M24", title: "있잖아 (As Time Goes By)" },
        { part: "Encore", type: "mc", title: "MC" },
        { part: "Encore", no: "M25", title: "Step By Step" },
        { part: "Encore", type: "mc", title: "ENCORE MENT" },
        { part: "Encore", no: "M26", title: "I Wonder" },
        { part: "Encore", no: "M27", title: "I Wonder, Always" },
        { part: "W Encore", no: "M28", title: "I Feel Good", time: "19:48", approx: true },
        { part: "W Encore", no: "M29", title: "Count To Love (Korean Ver.)" },
        { part: "W Encore", no: "M30", title: "돌아버리겠다 (But I Like You)" },
        { part: "W Encore", no: "M31", title: "ADIOS!" },
        { part: "Added", no: "+1", title: "오늘만 I LOVE YOU" },
        { part: "Added", no: "+2", title: "Serenade" },
        { part: "Added", no: "+3", title: "Earth, Wind & Fire" },
      ],
    },
  ],
};
