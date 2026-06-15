import { useState, useEffect } from "react";

// ────────────────────────────────────────────
// 초기 데이터
// ────────────────────────────────────────────
const INITIAL_EMPLOYEES = [
  { id: 1, name: "허승희", joinDate: "2024-01-01", totalLeave: 28, role: "직원", password: "921218" },
  { id: 2, name: "남윤이", joinDate: "2024-01-01", totalLeave: 26, role: "직원", password: "880429" },
  { id: 3, name: "김초은", joinDate: "2024-01-01", totalLeave: 25, role: "직원", password: "920227" },
  { id: 4, name: "송새롬", joinDate: "2024-01-01", totalLeave: 24, role: "직원", password: "900911" },
  { id: 5, name: "오은지", joinDate: "2024-01-01", totalLeave: 27, role: "직원", password: "920901" },
  { id: 6, name: "문슬기", joinDate: "2024-01-01", totalLeave: 22, role: "직원", password: "910410" },
  { id: 7, name: "김현지", joinDate: "2024-01-01", totalLeave: 4, role: "직원", password: "941125" },
  { id: 8, name: "최윤정", joinDate: "2024-01-01", totalLeave: 9999, unlimited: true, role: "직원", password: "871031" },
];

const ADMIN = { id: 0, name: "최윤정", role: "admin", password: "871031" };

function loadState(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function saveState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const EVENT_COLORS = ["#3b5bdb","#f76707","#2f9e44","#e03131","#7c3aed","#0ca678"];
const EVENT_TYPES = ["팝업", "워크샵", "할인행사", "회의", "기타"];

// ────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);
const fmt = (d) => d ? new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : "-";
const diffDays = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000) + 1;

function calcUsedLeave(leaves, empId) {
  return leaves
    .filter(l => l.empId === empId && l.status === "approved")
    .reduce((sum, l) => sum + diffDays(l.startDate, l.endDate), 0);
}

// ────────────────────────────────────────────
// 색상
// ────────────────────────────────────────────
const C = {
  bg: "#f5f6fa",
  card: "#ffffff",
  primary: "#3b5bdb",
  primaryLight: "#e7edff",
  accent: "#f76707",
  green: "#2f9e44",
  greenLight: "#ebfbee",
  red: "#e03131",
  redLight: "#fff5f5",
  yellow: "#f59f00",
  yellowLight: "#fff9db",
  text: "#212529",
  sub: "#868e96",
  border: "#dee2e6",
};

const btn = (bg, color = "#fff", extra = {}) => ({
  background: bg, color, border: "none", borderRadius: 10,
  padding: "10px 20px", fontWeight: 700, fontSize: 14,
  cursor: "pointer", ...extra,
});

// ────────────────────────────────────────────
// 로그인 화면
// ────────────────────────────────────────────
function LoginScreen({ employees, onLogin }) {
  const [mode, setMode] = useState("emp");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [pw, setPw] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [err, setErr] = useState("");

  const selectEmp = (emp) => { setSelectedEmp(emp); setPw(""); setErr(""); };

  const loginEmp = () => {
    if (pw === selectedEmp.password) { onLogin(selectedEmp); }
    else { setErr("생년월일이 맞지 않아요!"); }
  };

  const loginAdmin = () => {
    if (adminPw === ADMIN.password) { onLogin(ADMIN); }
    else { setErr("비밀번호가 틀렸어요!"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏢</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text }}>우리 팀 근무앱</h1>
          <p style={{ margin: "6px 0 0", color: C.sub, fontSize: 14 }}>출퇴근 · 휴가 관리</p>
        </div>

        <div style={{ background: C.card, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px #0001" }}>
          <div style={{ display: "flex", marginBottom: 20, background: C.bg, borderRadius: 10, padding: 4 }}>
            {["직원 로그인", "관리자 로그인"].map((t, i) => (
              <button key={i} onClick={() => { setMode(i === 0 ? "emp" : "admin"); setErr(""); setSelectedEmp(null); }}
                style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: (i === 0 ? mode === "emp" : mode === "admin") ? C.primary : "transparent",
                  color: (i === 0 ? mode === "emp" : mode === "admin") ? "#fff" : C.sub }}>
                {t}
              </button>
            ))}
          </div>

          {mode === "emp" ? (
            !selectedEmp ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: C.sub }}>이름을 선택하세요</p>
                {employees.map(emp => (
                  <button key={emp.id} onClick={() => selectEmp(emp)}
                    style={{ ...btn(C.primaryLight, C.primary), textAlign: "left", fontSize: 15 }}>
                    {emp.name}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => { setSelectedEmp(null); setErr(""); }}
                  style={{ ...btn("none", C.sub), padding: "0 0 12px", fontSize: 13 }}>
                  ← 다시 선택
                </button>
                <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: C.text }}>{selectedEmp.name}님</p>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: C.sub }}>생년월일 6자리를 입력하세요 (예: 901215)</p>
                <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(""); }}
                  onKeyDown={e => e.key === "Enter" && loginEmp()}
                  placeholder="생년월일 6자리"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
                    fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: 8 }} />
                {err && <p style={{ color: C.red, fontSize: 13, margin: "0 0 8px" }}>{err}</p>}
                <button onClick={loginEmp} style={{ ...btn(C.primary), width: "100%", padding: "13px" }}>로그인</button>
              </div>
            )
          ) : (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: C.sub }}>관리자 비밀번호</p>
              <input type="password" value={adminPw} onChange={e => { setAdminPw(e.target.value); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && loginAdmin()}
                placeholder="비밀번호 입력"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
                  fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: 8 }} />
              {err && <p style={{ color: C.red, fontSize: 13, margin: "0 0 8px" }}>{err}</p>}
              <button onClick={loginAdmin} style={{ ...btn(C.primary), width: "100%" }}>로그인</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 직원 화면
// ────────────────────────────────────────────
function EmployeeScreen({ user, employees, attendance, setAttendance, leaves, setLeaves, companyEvents, onLogout }) {
  const [tab, setTab] = useState("home");
  const [leaveForm, setLeaveForm] = useState({ startDate: today(), endDate: today(), reason: "" });
  const [toast, setToast] = useState("");

  const todayRec = attendance.find(a => a.empId === user.id && a.date === today());
  const usedLeave = calcUsedLeave(leaves, user.id);
  const remainLeave = user.totalLeave - usedLeave;
  const myLeaves = leaves.filter(l => l.empId === user.id).sort((a, b) => b.id - a.id);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const clockIn = () => {
    if (todayRec?.clockIn) return;
    const rec = { id: Date.now(), empId: user.id, date: today(), clockIn: nowTime(), clockOut: null };
    const next = [...attendance, rec];
    setAttendance(next); saveState("attendance", next);
    showToast("✅ 출근 완료!");
  };

  const clockOut = () => {
    if (!todayRec?.clockIn || todayRec?.clockOut) return;
    const next = attendance.map(a => a.id === todayRec.id ? { ...a, clockOut: nowTime() } : a);
    setAttendance(next); saveState("attendance", next);
    showToast("👋 퇴근 완료!");
  };

  const applyLeave = () => {
    if (!leaveForm.startDate || !leaveForm.endDate) return;
    const days = diffDays(leaveForm.startDate, leaveForm.endDate);
    if (!user.unlimited && days > remainLeave) { showToast("❌ 남은 휴가가 부족해요!"); return; }
    const rec = { id: Date.now(), empId: user.id, empName: user.name, ...leaveForm, status: "pending", appliedAt: today() };
    const next = [...leaves, rec];
    setLeaves(next); saveState("leaves", next);
    setLeaveForm({ startDate: today(), endDate: today(), reason: "" });
    showToast("📋 휴가 신청 완료! 승인 대기 중이에요.");
    setTab("leave");
  };

  const cancelLeave = (id) => {
    const next = leaves.filter(l => l.id !== id);
    setLeaves(next); saveState("leaves", next);
    showToast("🗑 신청이 취소됐어요.");
  };

  // 이번달 근무 기록
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRecs = attendance.filter(a => a.empId === user.id && a.date.startsWith(thisMonth));

  const calcHours = (ci, co) => {
    if (!ci || !co) return "-";
    const [h1, m1] = ci.split(":").map(Number);
    const [h2, m2] = co.split(":").map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    return `${Math.floor(mins / 60)}시간 ${mins % 60}분`;
  };

  // 전체 휴가 캘린더용
  const approvedLeaves = leaves.filter(l => l.status === "approved");

  const statusBadge = (s) => {
    const map = { pending: ["대기중", C.yellow, C.yellowLight], approved: ["승인됨", C.green, C.greenLight], rejected: ["반려됨", C.red, C.redLight] };
    const [label, color, bg] = map[s] || ["?", C.sub, C.bg];
    return <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, padding: "3px 10px", borderRadius: 20 }}>{label}</span>;
  };

  const TABS = [{ k: "home", label: "🏠 홈" }, { k: "apply", label: "✉️ 휴가신청" }, { k: "leave", label: "📋 내 휴가" }, { k: "calendar", label: "📅 팀 캘린더" }];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: C.text,
          color: "#fff", padding: "12px 24px", borderRadius: 50, fontSize: 14, fontWeight: 700, zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* 헤더 */}
      <div style={{ background: C.primary, padding: "20px 20px 16px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>안녕하세요 👋</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{user.name}님</div>
          </div>
          <button onClick={onLogout} style={{ ...btn("rgba(255,255,255,0.2)", "#fff"), fontSize: 12, padding: "6px 14px" }}>로그아웃</button>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ flex: 1, padding: "12px 8px", border: "none", background: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
              color: tab === t.k ? C.primary : C.sub,
              borderBottom: tab === t.k ? `2px solid ${C.primary}` : "2px solid transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 500, margin: "0 auto" }}>

        {/* 홈 */}
        {tab === "home" && (
          <div>
            {/* 출퇴근 카드 */}
            <div style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 1px 8px #0001" }}>
              <div style={{ fontSize: 13, color: C.sub, marginBottom: 4 }}>오늘 출퇴근</div>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 16 }}>{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: C.greenLight, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>출근</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{todayRec?.clockIn || "--:--"}</div>
                </div>
                <div style={{ background: C.primaryLight, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>퇴근</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{todayRec?.clockOut || "--:--"}</div>
                </div>
              </div>
              {todayRec?.clockIn && todayRec?.clockOut && (
                <div style={{ textAlign: "center", fontSize: 13, color: C.sub, marginBottom: 12 }}>
                  근무시간 {calcHours(todayRec.clockIn, todayRec.clockOut)}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={clockIn} disabled={!!todayRec?.clockIn}
                  style={{ ...btn(todayRec?.clockIn ? "#e9ecef" : C.green, todayRec?.clockIn ? C.sub : "#fff"), padding: "14px" }}>
                  {todayRec?.clockIn ? "출근 완료" : "출근하기 ✅"}
                </button>
                <button onClick={clockOut} disabled={!todayRec?.clockIn || !!todayRec?.clockOut}
                  style={{ ...btn((!todayRec?.clockIn || todayRec?.clockOut) ? "#e9ecef" : C.accent, (!todayRec?.clockIn || todayRec?.clockOut) ? C.sub : "#fff"), padding: "14px" }}>
                  {todayRec?.clockOut ? "퇴근 완료" : "퇴근하기 👋"}
                </button>
              </div>
            </div>

            {/* 휴가 현황 */}
            <div style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 1px 8px #0001" }}>
              <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>휴가 현황</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[["총 휴가", user.unlimited ? "무제한" : user.totalLeave + "일", C.primary], ["사용", usedLeave + "일", C.accent], ["잔여", user.unlimited ? "∞" : remainLeave + "일", C.green]].map(([l, v, c]) => (
                  <div key={l} style={{ background: C.bg, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.sub }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 이번달 근무 */}
            <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: "0 1px 8px #0001" }}>
              <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>이번달 근무 기록</div>
              {monthRecs.length === 0 ? (
                <div style={{ textAlign: "center", color: C.sub, fontSize: 13, padding: "20px 0" }}>기록이 없어요</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {monthRecs.slice(-5).reverse().map(r => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: C.bg, borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(r.date)}</div>
                      <div style={{ fontSize: 13, color: C.sub }}>{r.clockIn} → {r.clockOut || "근무중"}</div>
                      <div style={{ fontSize: 12, color: C.primary }}>{calcHours(r.clockIn, r.clockOut)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 휴가 신청 */}
        {tab === "apply" && (
          <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: "0 1px 8px #0001" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>휴가 신청</div>
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>잔여 휴가: <strong style={{ color: C.green }}>{user.unlimited ? "무제한 ∞" : remainLeave + "일"}</strong></div>

            <label style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>시작일</label>
            <input type="date" value={leaveForm.startDate}
              onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))}
              style={{ display: "block", width: "100%", marginTop: 6, marginBottom: 14, padding: "12px 14px",
                borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 15, boxSizing: "border-box" }} />

            <label style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>종료일</label>
            <input type="date" value={leaveForm.endDate}
              onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))}
              style={{ display: "block", width: "100%", marginTop: 6, marginBottom: 14, padding: "12px 14px",
                borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 15, boxSizing: "border-box" }} />

            <label style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>사유 (선택)</label>
            <textarea value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="사유를 입력하세요"
              style={{ display: "block", width: "100%", marginTop: 6, marginBottom: 20, padding: "12px 14px",
                borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box",
                resize: "none", height: 80, fontFamily: "inherit" }} />

            {leaveForm.startDate && leaveForm.endDate && (
              <div style={{ background: C.primaryLight, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14 }}>
                신청 일수: <strong style={{ color: C.primary }}>{diffDays(leaveForm.startDate, leaveForm.endDate)}일</strong>
              </div>
            )}

            <button onClick={applyLeave} style={{ ...btn(C.primary), width: "100%", padding: "14px" }}>
              신청하기 →
            </button>
          </div>
        )}

        {/* 내 휴가 목록 */}
        {tab === "leave" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>내 휴가 내역</div>
            {myLeaves.length === 0 ? (
              <div style={{ background: C.card, borderRadius: 16, padding: 40, textAlign: "center", color: C.sub }}>
                신청한 휴가가 없어요
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myLeaves.map(l => (
                  <div key={l.id} style={{ background: C.card, borderRadius: 16, padding: 18, boxShadow: "0 1px 8px #0001" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{fmt(l.startDate)} ~ {fmt(l.endDate)}</div>
                      {statusBadge(l.status)}
                    </div>
                    <div style={{ fontSize: 13, color: C.sub, marginBottom: 4 }}>
                      {diffDays(l.startDate, l.endDate)}일 · 신청일 {fmt(l.appliedAt)}
                    </div>
                    {l.reason && <div style={{ fontSize: 13, color: C.sub }}>{l.reason}</div>}
                    {l.status === "pending" && (
                      <button onClick={() => cancelLeave(l.id)}
                        style={{ ...btn(C.redLight, C.red), marginTop: 10, fontSize: 12, padding: "6px 14px" }}>
                        취소하기
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 팀 캘린더 */}
        {tab === "calendar" && (
          <CalendarView leaves={leaves} companyEvents={companyEvents} />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 관리자 화면
// ────────────────────────────────────────────
function AdminScreen({ employees, attendance, leaves, setLeaves, companyEvents, setCompanyEvents, onLogout }) {
  const [tab, setTab] = useState("leave");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const pendingLeaves = leaves.filter(l => l.status === "pending").sort((a, b) => b.id - a.id);
  const approvedLeaves = leaves.filter(l => l.status === "approved");

  const decide = (id, status) => {
    const next = leaves.map(l => l.id === id ? { ...l, status } : l);
    setLeaves(next); saveState("leaves", next);
    showToast(status === "approved" ? "✅ 승인했어요!" : "❌ 반려했어요.");
  };

  const todayStr = today();
  const onLeaveToday = approvedLeaves.filter(l => l.startDate <= todayStr && l.endDate >= todayStr);

  const TABS = [{ k: "leave", label: "✉️ 휴가 승인" }, { k: "status", label: "👥 직원 현황" }, { k: "attend", label: "🕐 출퇴근" }, { k: "events", label: "📌 회사 일정" }];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: C.text,
          color: "#fff", padding: "12px 24px", borderRadius: 50, fontSize: 14, fontWeight: 700, zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <div style={{ background: "#1a1a2e", padding: "20px 20px 16px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>관리자 모드 👑</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>사장님</div>
          </div>
          <button onClick={onLogout} style={{ ...btn("rgba(255,255,255,0.15)", "#fff"), fontSize: 12, padding: "6px 14px" }}>로그아웃</button>
        </div>

        {/* 오늘 요약 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          {[
            ["전체 직원", employees.length + "명", "👥"],
            ["오늘 휴가", onLeaveToday.length + "명", "🏖️"],
            ["대기 승인", pendingLeaves.length + "건", "⏳"],
          ].map(([l, v, ic]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{ic}</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex" }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ flex: 1, padding: "12px 8px", border: "none", background: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              color: tab === t.k ? C.primary : C.sub,
              borderBottom: tab === t.k ? `2px solid ${C.primary}` : "2px solid transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>

        {/* 휴가 승인 */}
        {tab === "leave" && (
          <div>
            {pendingLeaves.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: C.accent }}>⏳ 승인 대기 ({pendingLeaves.length}건)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pendingLeaves.map(l => (
                    <div key={l.id} style={{ background: C.card, borderRadius: 16, padding: 18, boxShadow: "0 1px 8px #0001", borderLeft: `4px solid ${C.yellow}` }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{l.empName}</div>
                      <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>
                        {fmt(l.startDate)} ~ {fmt(l.endDate)} ({diffDays(l.startDate, l.endDate)}일)
                      </div>
                      {l.reason && <div style={{ fontSize: 13, color: C.sub, marginBottom: 10 }}>사유: {l.reason}</div>}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => decide(l.id, "approved")} style={{ ...btn(C.green), flex: 1 }}>승인 ✅</button>
                        <button onClick={() => decide(l.id, "rejected")} style={{ ...btn(C.red), flex: 1 }}>반려 ❌</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>전체 휴가 내역</div>
              {[...leaves].sort((a, b) => b.id - a.id).length === 0 ? (
                <div style={{ textAlign: "center", color: C.sub, padding: "30px 0" }}>신청 내역이 없어요</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...leaves].sort((a, b) => b.id - a.id).map(l => {
                    const color = { approved: C.green, rejected: C.red, pending: C.yellow }[l.status];
                    const label = { approved: "승인", rejected: "반려", pending: "대기" }[l.status];
                    return (
                      <div key={l.id} style={{ background: C.card, borderRadius: 12, padding: "14px 16px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        boxShadow: "0 1px 6px #0001" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{l.empName}</div>
                          <div style={{ fontSize: 12, color: C.sub }}>{fmt(l.startDate)} ~ {fmt(l.endDate)}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color, background: color + "22", padding: "4px 12px", borderRadius: 20 }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 직원 현황 */}
        {tab === "status" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>직원별 휴가 현황</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {employees.map(emp => {
                const used = calcUsedLeave(leaves, emp.id);
                const remain = emp.totalLeave - used;
                const pct = Math.round((used / emp.totalLeave) * 100);
                const onLeave = approvedLeaves.some(l => l.empId === emp.id && l.startDate <= todayStr && l.endDate >= todayStr);
                return (
                  <div key={emp.id} style={{ background: C.card, borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 8px #0001" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{emp.name}</span>
                        {onLeave && <span style={{ marginLeft: 8, fontSize: 11, background: C.greenLight, color: C.green, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>휴가중</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.sub }}>잔여 <strong style={{ color: C.primary }}>{emp.unlimited ? "∞" : remain + "일"}</strong> / {emp.unlimited ? "무제한" : emp.totalLeave + "일"}</div>
                    </div>
                    <div style={{ background: C.bg, borderRadius: 20, height: 8, overflow: "hidden" }}>
                      <div style={{ width: emp.unlimited ? "100%" : pct + "%", height: "100%", background: emp.unlimited ? C.primary : pct > 70 ? C.red : pct > 40 ? C.yellow : C.green, borderRadius: 20, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>사용 {used}일{emp.unlimited ? "" : ` (${pct}%)`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 출퇴근 현황 */}
        {tab === "attend" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>오늘 출퇴근 현황</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {employees.map(emp => {
                const rec = attendance.find(a => a.empId === emp.id && a.date === todayStr);
                return (
                  <div key={emp.id} style={{ background: C.card, borderRadius: 12, padding: "14px 16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 6px #0001" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                    <div style={{ textAlign: "right" }}>
                      {rec ? (
                        <>
                          <div style={{ fontSize: 13 }}>
                            <span style={{ color: C.green }}>▶ {rec.clockIn}</span>
                            {rec.clockOut && <span style={{ color: C.sub }}> → {rec.clockOut}</span>}
                          </div>
                          <div style={{ fontSize: 11, color: C.sub }}>
                            {rec.clockOut ? "퇴근 완료" : "근무 중 🟢"}
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: C.sub }}>미출근</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* 회사 일정 관리 */}
        {tab === "events" && (
          <CompanyEventManager companyEvents={companyEvents} setCompanyEvents={setCompanyEvents} saveState={saveState} showToast={showToast} />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 달력 뷰 컴포넌트
// ────────────────────────────────────────────
function CalendarView({ leaves, companyEvents }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const approvedLeaves = leaves.filter(l => l.status === "approved");
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;

  const getItemsForDay = (d) => {
    const ds = dateStr(d);
    const leavePeople = approvedLeaves.filter(l => l.startDate <= ds && l.endDate >= ds);
    const events = (companyEvents || []).filter(e => e.startDate <= ds && e.endDate >= ds);
    return { leavePeople, events };
  };

  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

  // 이번달 전체 일정 목록
  const monthStart = `${year}-${pad(month+1)}-01`;
  const monthEnd = `${year}-${pad(month+1)}-${pad(daysInMonth)}`;
  const monthLeaves = approvedLeaves.filter(l => l.startDate <= monthEnd && l.endDate >= monthStart);
  const monthEvents = (companyEvents || []).filter(e => e.startDate <= monthEnd && e.endDate >= monthStart);

  return (
    <div>
      {/* 월 이동 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }}
          style={{ ...btn(C.card, C.text), border: `1px solid ${C.border}`, padding: "8px 14px" }}>←</button>
        <div style={{ fontWeight: 800, fontSize: 17 }}>{year}년 {MONTH_NAMES[month]}</div>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }}
          style={{ ...btn(C.card, C.text), border: `1px solid ${C.border}`, padding: "8px 14px" }}>→</button>
      </div>

      {/* 달력 */}
      <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 8px #0001", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: C.primary }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ textAlign: "center", padding: "8px 0", fontSize: 12, fontWeight: 700,
              color: i === 0 ? "#ffa8a8" : i === 6 ? "#a8c8ff" : "#fff" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={"e"+i} style={{ minHeight: 60, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }} />
          ))}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const d = i + 1;
            const ds = dateStr(d);
            const { leavePeople, events } = getItemsForDay(d);
            const isToday = ds === todayStr;
            const col = (firstDay + i) % 7;
            return (
              <div key={d} style={{ minHeight: 60, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
                padding: "4px", background: isToday ? "#eef2ff" : "white" }}>
                <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 400,
                  color: isToday ? C.primary : col === 0 ? C.red : col === 6 ? C.primary : C.text,
                  width: isToday ? 20 : "auto", height: isToday ? 20 : "auto",
                  background: isToday ? C.primary : "none", color: isToday ? "#fff" : col === 0 ? C.red : col === 6 ? "#4dabf7" : C.text,
                  borderRadius: isToday ? "50%" : 0, display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 2 }}>{d}</div>
                {leavePeople.slice(0, 2).map((l, idx) => (
                  <div key={idx} style={{ fontSize: 9, background: "#e7edff", color: C.primary,
                    borderRadius: 3, padding: "1px 3px", marginBottom: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {l.empName}
                  </div>
                ))}
                {events.slice(0, 1).map((e, idx) => (
                  <div key={idx} style={{ fontSize: 9, background: e.color + "33", color: e.color,
                    borderRadius: 3, padding: "1px 3px", marginBottom: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                    fontWeight: 700 }}>
                    {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 이번달 일정 목록 */}
      {(monthLeaves.length > 0 || monthEvents.length > 0) && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>이번달 일정</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {monthEvents.map(e => (
              <div key={e.id} style={{ background: C.card, borderRadius: 12, padding: "12px 16px",
                borderLeft: `4px solid ${e.color}`, boxShadow: "0 1px 6px #0001" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: e.color }}>{e.title}</div>
                <div style={{ fontSize: 12, color: C.sub }}>{fmt(e.startDate)}{e.startDate !== e.endDate ? ` ~ ${fmt(e.endDate)}` : ""} · {e.type}</div>
              </div>
            ))}
            {monthLeaves.map(l => (
              <div key={l.id} style={{ background: C.card, borderRadius: 12, padding: "12px 16px",
                borderLeft: `4px solid ${C.primary}`, boxShadow: "0 1px 6px #0001" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{l.empName} 휴가</div>
                <div style={{ fontSize: 12, color: C.sub }}>{fmt(l.startDate)} ~ {fmt(l.endDate)} ({diffDays(l.startDate, l.endDate)}일)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// 회사 일정 관리 컴포넌트
// ────────────────────────────────────────────
function CompanyEventManager({ companyEvents, setCompanyEvents, saveState, showToast }) {
  const [form, setForm] = useState({ title: "", type: "팝업", startDate: today(), endDate: today(), color: EVENT_COLORS[0] });

  const addEvent = () => {
    if (!form.title.trim()) { showToast("일정 이름을 입력해주세요!"); return; }
    const ev = { id: Date.now(), ...form };
    const next = [...companyEvents, ev];
    setCompanyEvents(next); saveState("companyEvents", next);
    setForm({ title: "", type: "팝업", startDate: today(), endDate: today(), color: EVENT_COLORS[0] });
    showToast("📌 일정이 추가됐어요!");
  };

  const deleteEvent = (id) => {
    const next = companyEvents.filter(e => e.id !== id);
    setCompanyEvents(next); saveState("companyEvents", next);
    showToast("🗑 일정이 삭제됐어요.");
  };

  return (
    <div>
      {/* 일정 추가 폼 */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 1px 8px #0001" }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>📌 일정 추가</div>

        <label style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>일정 이름</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="예: 봄 할인행사"
          style={{ display: "block", width: "100%", marginTop: 6, marginBottom: 14, padding: "11px 14px",
            borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box", outline: "none" }} />

        <label style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>종류</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, marginBottom: 14 }}>
          {EVENT_TYPES.map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
              style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
                background: form.type === t ? C.primary : C.bg,
                color: form.type === t ? "#fff" : C.sub, fontWeight: form.type === t ? 700 : 400 }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>시작일</label>
            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px",
                borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>종료일</label>
            <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px",
                borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }} />
          </div>
        </div>

        <label style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>색상</label>
        <div style={{ display: "flex", gap: 8, marginTop: 6, marginBottom: 16 }}>
          {EVENT_COLORS.map(c => (
            <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
              style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                border: form.color === c ? `3px solid ${C.text}` : "3px solid transparent" }} />
          ))}
        </div>

        <button onClick={addEvent} style={{ ...btn(C.primary), width: "100%", padding: "13px" }}>
          일정 추가하기 +
        </button>
      </div>

      {/* 일정 목록 */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>등록된 일정</div>
      {companyEvents.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 14, padding: 32, textAlign: "center", color: C.sub }}>
          등록된 일정이 없어요
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...companyEvents].sort((a, b) => a.startDate.localeCompare(b.startDate)).map(e => (
            <div key={e.id} style={{ background: C.card, borderRadius: 12, padding: "14px 16px",
              borderLeft: `4px solid ${e.color}`, display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: "0 1px 6px #0001" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                  {e.type} · {fmt(e.startDate)}{e.startDate !== e.endDate ? ` ~ ${fmt(e.endDate)}` : ""}
                </div>
              </div>
              <button onClick={() => deleteEvent(e.id)}
                style={{ ...btn(C.redLight, C.red), fontSize: 12, padding: "6px 12px" }}>삭제</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// 메인
// ────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState(() => loadState("employees", INITIAL_EMPLOYEES));
  const [attendance, setAttendance] = useState(() => loadState("attendance", []));
  const [leaves, setLeaves] = useState(() => loadState("leaves", []));
  const [companyEvents, setCompanyEvents] = useState(() => loadState("companyEvents", []));

  const logout = () => setUser(null);

  if (!user) return <LoginScreen employees={employees} onLogin={setUser} />;
  if (user.role === "admin") return (
    <AdminScreen employees={employees} attendance={attendance} leaves={leaves} setLeaves={setLeaves}
      companyEvents={companyEvents} setCompanyEvents={setCompanyEvents} onLogout={logout} />
  );
  return (
    <EmployeeScreen user={user} employees={employees} attendance={attendance} setAttendance={setAttendance}
      leaves={leaves} setLeaves={setLeaves} companyEvents={companyEvents} onLogout={logout} />
  );
}
