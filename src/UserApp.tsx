import React from "react";

type User = { id: string; email: string; name: string; createdAt: string };
type View = "signup" | "members" | "mypage" | "history" | "saved";
const selectedUserKey = "mora-go:selected-user";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
  return body;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function UserApp({ apiBaseUrl = "" }: { apiBaseUrl?: string }) {
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
  const selectedUser = users.find((user) => user.id === selectedId) ?? null;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<{ users: User[] }>(`${apiBaseUrl}/api/users`);
      setUsers(data.users);
      const savedId = localStorage.getItem(selectedUserKey);
      if (savedId && data.users.some((user) => user.id === savedId)) {
        setSelectedId(savedId); setView("mypage");
      } else if (savedId) {
        localStorage.removeItem(selectedUserKey); setSelectedId(null);
      }
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "User API unavailable");
    } finally { setLoading(false); }
  }, [apiBaseUrl]);

  React.useEffect(() => { void load(); }, [load]);

  async function signUp(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const data = await request<{ user: User }>(`${apiBaseUrl}/api/users`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }),
      });
      setUsers((current) => [data.user, ...current]);
      setSelectedId(data.user.id); localStorage.setItem(selectedUserKey, data.user.id);
      setName(""); setEmail(""); setMessage("Welcome! Your learner profile is ready."); setView("mypage");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create account");
    } finally { setBusy(false); }
  }

  async function withdraw() {
    if (!selectedUser || !window.confirm("Delete this account permanently? This cannot be undone.")) return;
    setBusy(true); setError("");
    try {
      await request<void>(`${apiBaseUrl}/api/users/${selectedUser.id}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => user.id !== selectedUser.id));
      localStorage.removeItem(selectedUserKey); setSelectedId(null);
      setMessage("The account has been deleted."); setView("signup");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete account");
    } finally { setBusy(false); }
  }

  function openProfile(user: User) {
    localStorage.setItem(selectedUserKey, user.id);
    setSelectedId(user.id); setMessage(""); setError(""); setView("mypage");
  }

  return <section className="user-mfe">
    <header className="user-heading"><div><span>YOUR SPACE</span><h2>Learning profile</h2><p>Manage your account and keep your English journey moving.</p></div><div className="member-count"><strong>{users.length}</strong><span>active learners</span></div></header>
    <nav className="user-tabs" aria-label="User features"><button className={view === "signup" ? "active" : ""} onClick={() => setView("signup")}><i>＋</i> Sign up</button><button className={view === "members" ? "active" : ""} onClick={() => setView("members")}><i>◎</i> Members</button><button className={view === "mypage" ? "active" : ""} onClick={() => setView("mypage")}><i>●</i> My page</button></nav>
    <div aria-live="polite">{message && <p className="user-message">✓ {message}</p>}{error && <p className="user-error">! {error}</p>}</div>
    {view === "signup" && <div className="signup-layout"><aside className="welcome-panel"><span className="eyebrow">MORA GO ACCOUNT</span><h3>One profile.<br />Every lesson.</h3><p>Save your place, follow your progress, and build a learning habit that lasts.</p><div className="welcome-orbit"><span>MG</span></div></aside><form className="account-card signup-form" onSubmit={signUp}><div><span className="eyebrow">CREATE PROFILE</span><h3>Start learning English</h3><p>It takes less than a minute.</p></div><label>Name<input required minLength={2} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label><label>Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><button className="primary-action" disabled={busy}>{busy ? "Creating…" : "Create my profile"}</button><small className="form-note">Free to start · No payment details</small></form></div>}
    {view === "members" && <div className="user-list" aria-busy={loading}><div className="list-heading"><div><span className="eyebrow">LEARNERS</span><h3>Choose a profile</h3></div><button onClick={() => void load()} disabled={loading}>↻ Refresh</button></div>{loading && <div className="empty-state"><span className="loading-ring" /><strong>Loading learners</strong></div>}{!loading && users.length === 0 && !error && <div className="empty-state"><strong>No learners yet</strong><p>Create the first profile to begin.</p><button onClick={() => setView("signup")}>Create profile</button></div>}{!loading && users.map((user) => <button className="member-row" key={user.id} onClick={() => openProfile(user)}><span className="avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><time>{new Date(user.createdAt).toLocaleDateString()}</time><b>›</b></button>)}</div>}
    {view === "mypage" && (selectedUser ? <div className="profile-layout"><section className="profile-hero"><div className="profile-cover" /><div className="profile-identity"><span className="avatar large">{initials(selectedUser.name)}</span><div><span className="eyebrow">MY PAGE</span><h3>{selectedUser.name}</h3><p>{selectedUser.email}</p></div><span className="profile-badge">Active learner</span></div></section><section className="progress-grid" aria-label="Learning summary"><article><span>Lessons watched</span><strong>3</strong><small>Keep your streak going</small></article><article><span>Current level</span><strong>A2</strong><small>Everyday conversation</small></article><article><span>Weekly goal</span><strong>2/3</strong><small>One lesson to go</small></article></section><section className="account-card details-card"><div><span className="eyebrow">ACCOUNT DETAILS</span><h3>Profile information</h3></div><dl><div><dt>Member ID</dt><dd>{selectedUser.id}</dd></div><div><dt>Joined</dt><dd>{new Date(selectedUser.createdAt).toLocaleString()}</dd></div></dl></section><section className="danger-zone"><div><strong>Delete account</strong><p>Permanently remove this learner profile and its account data.</p></div><button className="danger-action" disabled={busy} onClick={() => void withdraw()}>{busy ? "Deleting…" : "Delete account"}</button></section></div> : <div className="empty-state profile-empty"><span className="empty-avatar">?</span><strong>Select your profile</strong><p>Open Members and choose an account to view My page.</p><button onClick={() => setView("members")}>Open members</button></div>)}
    {view === "history" && <section className="library-view"><div className="library-heading"><span className="eyebrow">YOUR ACTIVITY</span><h3>Learning history</h3><p>Pick up exactly where you left off.</p></div><div className="history-list"><article><span className="lesson-thumb purple">👋<small>12:00</small></span><div><strong>Confident introductions</strong><p>Lesson 1 · A1 speaking</p><div className="mini-progress"><i style={{width:"80%"}} /></div><small>80% complete</small></div><button aria-label="Continue Confident introductions">Continue</button></article><article><span className="lesson-thumb coral">💬<small>18:00</small></span><div><strong>Ask better follow-up questions</strong><p>Lesson 2 · A2 conversation</p><div className="mini-progress"><i style={{width:"35%"}} /></div><small>35% complete</small></div><button aria-label="Continue Ask better follow-up questions">Continue</button></article></div></section>}
    {view === "saved" && <section className="library-view"><div className="library-heading"><span className="eyebrow">YOUR LIBRARY</span><h3>Saved lessons</h3><p>Lessons you bookmarked for later.</p></div><div className="saved-grid"><article><span className="lesson-thumb green">🎯<small>22:00</small></span><div><strong>Share a clear opinion</strong><p>B1 · Speaking · Mora Go English</p></div><button aria-label="Remove Share a clear opinion from saved">♡ Saved</button></article><article className="saved-empty"><span>＋</span><strong>Build your library</strong><p>Save a lesson and it will appear here.</p></article></div></section>}
  </section>;
}
