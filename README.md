⚡ FITSTACK - 智慧健身簽到系統
FITSTACK 是一款專為健身房設計的「電競風」會員點數管理系統。透過 Firebase 即時資料庫與 React 動態介面，提供極致流動的用戶體驗與硬核的視覺美學。

使用方法
會員模式：選擇allen使用者，輸入密碼1234，進入頁面後即可選擇日期進行簽到（簽到密碼：1234）

管理員模式：輸入密碼admin123，即可選擇會員進行增加、刪除點數、兌換獎勵

🚀 核心功能 (Current Version 2.0)
雙角色權限系統：管理員（Admin）可控全局，會員（User）專注進度。

能量槽進度條：動態計算 1-10 點循環，具備流光動畫效果。

霓虹日曆系統：視覺化簽到追蹤，支援跨月份查詢。

管理者控制台：

即時會員清單流覽。

手動補點功能。

獎勵兌換系統（點數扣除邏輯）。

完全響應式設計：針對手機裝置優化，具備手勢與震動感回饋。

🛠️ 技術棧 (Tech Stack)
前端框架: React.js (Vite)

動畫引擎: Framer Motion

圖標庫: Lucide React

資料庫: Firebase Firestore

日期處理: date-fns

樣式系統: CSS Variables (Cyberpunk Style)

📂 專案結構
Bash
src/
 ├── components/
 │    ├── ProgressBar.jsx    # 能量槽組件
 │    ├── GymCalendar.jsx    # 霓虹日曆
 │    └── CheckInModal.jsx   # 互動彈窗
 ├── pages/
 │    └── Login.jsx          # 雙權限登入入口
 ├── App.jsx                 # 核心邏輯處理中心
 ├── App.css                 # 視覺定義與掃描線效果
 └── firebase.js             # 資料庫連線配置
🛰️ 未來擴充路線圖 (Future Roadmap)
這是我為你規劃的後續開發方向，你可以依序挑戰：

第一階段：自動化與工具
[ ] QR Code 簽到：會員出示專屬 QR Code，管理員掃描後自動完成補點。

[ ] Excel 數據導出：管理員一鍵下載本月所有會員的簽到紀錄報表。

[ ] 自動推送通知：當會員集滿 10 點時，自動發送 Web Push 通知或 Email。

第二階段：社群與競爭
[ ] 戰力排行榜：顯示本月簽到次數最多的前五名「健身狂人」。

[ ] 連續紀錄 (Streak)：顯示會員連續簽到天數，增加使用者黏著度。

第三階段：安全與擴充
[ ] Firebase Auth 集成：目前為邏輯登入，未來可接入手機簡訊驗證或 Google 登入。

[ ] 多語系支援：擴充繁體中文 / 英文雙語界面。