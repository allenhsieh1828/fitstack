// src/data/mockData.js

export const MOCK_USERS = [
  {
    id: "user_01",
    name: "Allen",
    checkInHistory: ["2026-01-01", "2026-01-05", "2026-01-10", "2026-01-20"],
    totalPoints: 4,
    lastCheckIn: "2026-01-20"
  },
  {
    id: "user_02",
    name: "Sabrina",
    checkInHistory: ["2026-01-02", "2026-01-03", "2026-01-04"],
    totalPoints: 3,
    lastCheckIn: "2026-01-04"
  },
  {
    id: "user_03",
    name: "Kevin",
    checkInHistory: ["2026-01-15"],
    totalPoints: 1,
    lastCheckIn: "2026-01-15"
  },
  {
    id: "user_04",
    name: "Emma",
    checkInHistory: [],
    totalPoints: 0,
    lastCheckIn: "無紀錄"
  }
];

// 為了不弄壞原本的使用者界面，我們保留一個預設導出的使用者
export const MOCK_USER = MOCK_USERS[0];