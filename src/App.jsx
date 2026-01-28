import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // 確保路徑正確
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Calendar, List, Trophy, UserCog, Dumbbell, X, LockKeyhole } from 'lucide-react';

// --- 子組件：簽到彈窗 ---
function CheckInModal({ isOpen, onClose, onConfirm }) {
  const [code, setCode] = useState('');
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>輸入驗證碼簽到</h3>
        <input 
          type="tel" maxLength="4" value={code} 
          onChange={(e) => setCode(e.target.value)} 
          placeholder="0000" 
        />
        <button onClick={() => { onConfirm(code); setCode(''); }}>確認</button>
        <button onClick={onClose}>取消</button>
      </div>
    </div>
  );
}

// --- 主程式 App ---
function App() {
  const [view, setView] = useState('member'); // 'member' 或 'admin'
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. 從 Firebase 實時抓取紀錄
  useEffect(() => {
    const q = query(collection(db, "checkins"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(data);
    });
    return () => unsubscribe();
  }, []);

  // 2. 簽到功能 (寫入 Firebase)
  const handleCheckIn = async (code) => {
    if (code === "1234") { // 假設驗證碼
      await addDoc(collection(db, "checkins"), {
        userId: "user_01",
        timestamp: serverTimestamp(),
        type: "gym_checkin"
      });
      alert("簽到成功！");
      setIsModalOpen(false);
    } else {
      alert("驗證碼錯誤");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* 頂部切換模式 */}
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Dumbbell className="text-neon" /> FITSTACK
        </h1>
        <button onClick={() => setView(view === 'member' ? 'admin' : 'member')} className="bg-gray-800 p-2 rounded">
          {view === 'member' ? <UserCog size={20} /> : <List size={20} />}
        </button>
      </div>

      {view === 'member' ? (
        <div className="space-y-6">
          {/* 會員模式：月曆與集點 */}
          <section className="bg-gray-900 p-4 rounded-xl text-center">
            <Trophy className="mx-auto text-yellow-500 mb-2" />
            <p>目前點數：{records.length} / 10</p>
            <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(records.length / 10) * 100}%` }}></div>
            </div>
          </section>

          <button onClick={() => setIsModalOpen(true)} className="w-full bg-neon p-4 rounded-xl text-black font-bold">
            立即簽到
          </button>

          {/* 簡單紀錄清單 */}
          <div className="mt-4">
            <h3 className="mb-2">最近簽到紀錄</h3>
            {records.map(r => (
              <div key={r.id} className="bg-gray-800 p-3 rounded mb-2 text-sm">
                ✅ {r.timestamp?.toDate().toLocaleString() || "處理中..."}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-red-900/20 p-4 rounded-xl">
          <h2 className="text-xl mb-4 font-bold text-red-400">管理者模式</h2>
          <p>這裡顯示所有會員的簽到數據...</p>
          {/* 管理者專用清單 */}
        </div>
      )}

      <CheckInModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleCheckIn} 
      />
    </div>
  );
}

export default App;