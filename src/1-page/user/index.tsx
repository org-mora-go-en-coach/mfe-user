import React from "react";
import type { ActivityLesson, User } from "../../4-entity";
import type { UserAppProps } from "./type";
type View = "signup" | "members" | "mypage" | "history" | "saved";
const selectedUserKey = "mora-go:selected-user";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? `요청에 실패했습니다 (${response.status})`);
  return body;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function UserApp({ apiBaseUrl = "" }: UserAppProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(() => localStorage.getItem(selectedUserKey));
  const [view, setView] = React.useState<View>(() => {
    const requested = sessionStorage.getItem("mora-go:user-view");
    return requested === "history" || requested === "saved" || requested === "mypage" ? requested : "signup";
  });
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [activity, setActivity] = React.useState<{history:ActivityLesson[];saved:ActivityLesson[]}>({history:[],saved:[]});
  const [activityLoading, setActivityLoading] = React.useState(false);
  const selectedUser = users.find((user) => user.id === selectedId) ?? null;
  const userApiBaseUrl = apiBaseUrl.includes("/api/v") ? apiBaseUrl : `${apiBaseUrl}/api`;
  const lessonApiBaseUrl = apiBaseUrl.includes("localhost") ? "http://localhost:3001/api/v1.0.2" : "https://api-lesson-six.vercel.app/api/v1.0.2";

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<{ users: User[] }>(`${userApiBaseUrl}/users`);
      setUsers(data.users);
      const savedId = localStorage.getItem(selectedUserKey);
      if (savedId && data.users.some((user) => user.id === savedId)) {
        setSelectedId(savedId); setView("mypage");
      } else if (savedId) {
        localStorage.removeItem(selectedUserKey); setSelectedId(null);
      }
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "사용자 정보를 불러올 수 없습니다.");
    } finally { setLoading(false); }
  }, [userApiBaseUrl]);

  const loadActivity = React.useCallback(async () => {setActivityLoading(true);try{setActivity(await request<{history:ActivityLesson[];saved:ActivityLesson[]}>(`${lessonApiBaseUrl}/activity`));setError("")}catch(reason){setError(reason instanceof Error?reason.message:"학습 활동을 불러올 수 없습니다.")}finally{setActivityLoading(false)}},[lessonApiBaseUrl]);
  React.useEffect(() => { void load(); }, [load]);
  React.useEffect(() => { if(view==="history"||view==="saved")void loadActivity(); }, [view,loadActivity]);

  async function advanceLesson(lesson:ActivityLesson){setActivityLoading(true);try{await request(`${lessonApiBaseUrl}/lessons/${lesson.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({progress:Math.min(100,lesson.progress+10)})});await loadActivity();setMessage(`${lesson.title}의 진도를 저장했습니다.`)}catch(reason){setError(reason instanceof Error?reason.message:"진도를 저장할 수 없습니다.")}finally{setActivityLoading(false)}}
  async function removeSaved(lesson:ActivityLesson){setActivityLoading(true);try{await request(`${lessonApiBaseUrl}/lessons/${lesson.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({saved:false})});await loadActivity();setMessage(`${lesson.title} 강의를 보관함에서 제거했습니다.`)}catch(reason){setError(reason instanceof Error?reason.message:"보관한 강의를 변경할 수 없습니다.")}finally{setActivityLoading(false)}}

  async function signUp(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const data = await request<{ user: User }>(`${userApiBaseUrl}/users`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }),
      });
      setUsers((current) => [data.user, ...current]);
      setSelectedId(data.user.id); localStorage.setItem(selectedUserKey, data.user.id);
      setName(""); setEmail(""); setMessage("환영합니다! 학습 프로필이 준비되었습니다."); setView("mypage");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "계정을 만들 수 없습니다.");
    } finally { setBusy(false); }
  }

  async function withdraw() {
    if (!selectedUser || !window.confirm("이 계정을 영구적으로 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.")) return;
    setBusy(true); setError("");
    try {
      await request<void>(`${userApiBaseUrl}/users/${selectedUser.id}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => user.id !== selectedUser.id));
      localStorage.removeItem(selectedUserKey); setSelectedId(null);
      setMessage("계정이 삭제되었습니다."); setView("signup");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "계정을 삭제할 수 없습니다.");
    } finally { setBusy(false); }
  }

  function openProfile(user: User) {
    localStorage.setItem(selectedUserKey, user.id);
    setSelectedId(user.id); setMessage(""); setError(""); setView("mypage");
  }

  return <section className="user-mfe">
    <header className="user-heading"><div><span>나의 학습 공간</span><h2>학습 프로필</h2><p>계정과 영어 학습 여정을 관리하세요.</p></div><div className="member-count"><strong>{users.length}</strong><span>활성 학습자</span></div></header>
    <nav className="user-tabs" aria-label="사용자 기능"><button className={view === "signup" ? "active" : ""} onClick={() => setView("signup")}><i>＋</i> 가입하기</button><button className={view === "members" ? "active" : ""} onClick={() => setView("members")}><i>◎</i> 학습자</button><button className={view === "mypage" ? "active" : ""} onClick={() => setView("mypage")}><i>●</i> 마이페이지</button></nav>
    <div aria-live="polite">{message && <p className="user-message">✓ {message}</p>}{error && <p className="user-error">! {error}</p>}</div>
    {view === "signup" && <div className="signup-layout"><aside className="welcome-panel"><span className="eyebrow">MORA GO 계정</span><h3>하나의 프로필로<br />모든 강의를.</h3><p>학습 위치와 진도를 저장하고 꾸준한 학습 습관을 만들어 보세요.</p><div className="welcome-orbit"><span>MG</span></div></aside><form className="account-card signup-form" onSubmit={signUp}><div><span className="eyebrow">프로필 만들기</span><h3>영어 학습 시작하기</h3><p>1분이면 충분합니다.</p></div><label>이름<input required minLength={2} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="이름을 입력하세요" /></label><label>이메일<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><button className="primary-action" disabled={busy}>{busy ? "만드는 중…" : "내 프로필 만들기"}</button><small className="form-note">무료로 시작 · 결제 정보 불필요</small></form></div>}
    {view === "members" && <div className="user-list" aria-busy={loading}><div className="list-heading"><div><span className="eyebrow">학습자</span><h3>프로필 선택</h3></div><button onClick={() => void load()} disabled={loading}>↻ 새로고침</button></div>{loading && <div className="empty-state"><span className="loading-ring" /><strong>학습자 불러오는 중</strong></div>}{!loading && users.length === 0 && !error && <div className="empty-state"><strong>아직 학습자가 없습니다</strong><p>첫 프로필을 만들어 시작해 보세요.</p><button onClick={() => setView("signup")}>프로필 만들기</button></div>}{!loading && users.map((user) => <button className="member-row" key={user.id} onClick={() => openProfile(user)}><span className="avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><time>{new Date(user.createdAt).toLocaleDateString("ko-KR")}</time><b>›</b></button>)}</div>}
    {view === "mypage" && (selectedUser ? <div className="profile-layout"><section className="profile-hero"><div className="profile-cover" /><div className="profile-identity"><span className="avatar large">{initials(selectedUser.name)}</span><div><span className="eyebrow">마이페이지</span><h3>{selectedUser.name}</h3><p>{selectedUser.email}</p></div><span className="profile-badge">활성 학습자</span></div></section><section className="progress-grid" aria-label="학습 요약"><article><span>수강한 강의</span><strong>3</strong><small>연속 학습을 이어가세요</small></article><article><span>현재 레벨</span><strong>A2</strong><small>일상 회화</small></article><article><span>주간 목표</span><strong>2/3</strong><small>강의 하나가 남았습니다</small></article></section><section className="account-card details-card"><div><span className="eyebrow">계정 정보</span><h3>프로필 정보</h3></div><dl><div><dt>회원 ID</dt><dd>{selectedUser.id}</dd></div><div><dt>가입일</dt><dd>{new Date(selectedUser.createdAt).toLocaleString("ko-KR")}</dd></div></dl></section><section className="danger-zone"><div><strong>계정 삭제</strong><p>학습자 프로필과 계정 데이터를 영구적으로 삭제합니다.</p></div><button className="danger-action" disabled={busy} onClick={() => void withdraw()}>{busy ? "삭제 중…" : "계정 삭제"}</button></section></div> : <div className="empty-state profile-empty"><span className="empty-avatar">?</span><strong>프로필을 선택하세요</strong><p>학습자 목록에서 마이페이지를 확인할 계정을 선택하세요.</p><button onClick={() => setView("members")}>학습자 목록 열기</button></div>)}
    {view === "history" && <section className="library-view" aria-busy={activityLoading}><div className="library-heading"><span className="eyebrow">나의 활동</span><h3>학습 기록</h3><p>마지막으로 학습한 지점부터 이어서 시작하세요.</p></div>{activityLoading&&activity.history.length===0?<div className="empty-state"><span className="loading-ring"/><strong>학습 기록 불러오는 중</strong></div>:<div className="history-list">{activity.history.map((lesson,index)=><article key={lesson.id}><span className={`lesson-thumb ${index%2?"coral":"purple"}`}>{index%2?"💬":"👋"}<small>{lesson.durationMinutes}:00</small></span><div><strong>{lesson.title}</strong><p>{lesson.level} · 영어 강의</p><div className="mini-progress"><i style={{width:`${lesson.progress}%`}} /></div><small>{lesson.progress}% 완료</small></div><button disabled={activityLoading} onClick={()=>void advanceLesson(lesson)} aria-label={`${lesson.title} 이어서 학습`}>이어서 학습</button></article>)}</div>}</section>}
    {view === "saved" && <section className="library-view" aria-busy={activityLoading}><div className="library-heading"><span className="eyebrow">나의 보관함</span><h3>저장한 강의</h3><p>나중에 학습하려고 저장한 강의입니다.</p></div>{activityLoading&&activity.saved.length===0?<div className="empty-state"><span className="loading-ring"/><strong>저장한 강의 불러오는 중</strong></div>:<div className="saved-grid">{activity.saved.map(lesson=><article key={lesson.id}><span className="lesson-thumb green">🎯<small>{lesson.durationMinutes}:00</small></span><div><strong>{lesson.title}</strong><p>{lesson.level} · 모라 고 영어</p></div><button disabled={activityLoading} onClick={()=>void removeSaved(lesson)} aria-label={`${lesson.title} 보관함에서 제거`}>♡ 저장됨</button></article>)}<article className="saved-empty"><span>＋</span><strong>나만의 보관함 만들기</strong><p>강의를 저장하면 여기에 표시됩니다.</p></article></div>}</section>}
  </section>;
}
