import React from "react";

type User = { id: string; email: string; name: string; createdAt: string };
type View = "signup" | "members" | "mypage";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
  return body;
}

export function UserApp({ apiBaseUrl = "" }: { apiBaseUrl?: string }) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<View>("signup");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const selectedUser = users.find((user) => user.id === selectedId) ?? null;

  const load = React.useCallback(async () => {
    try {
      const data = await request<{ users: User[] }>(`${apiBaseUrl}/api/users`);
      setUsers(data.users);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "User API unavailable");
    }
  }, [apiBaseUrl]);

  React.useEffect(() => { void load(); }, [load]);

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const data = await request<{ user: User }>(`${apiBaseUrl}/api/users`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      setUsers((current) => [data.user, ...current]);
      setSelectedId(data.user.id); setName(""); setEmail("");
      setMessage("Welcome! Your account has been created."); setView("mypage");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create account");
    } finally { setBusy(false); }
  }

  async function withdraw() {
    if (!selectedUser || !window.confirm("Delete this account permanently?")) return;
    setBusy(true); setError("");
    try {
      await request<void>(`${apiBaseUrl}/api/users/${selectedUser.id}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => user.id !== selectedUser.id));
      setSelectedId(null); setMessage("The account has been deleted."); setView("signup");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete account");
    } finally { setBusy(false); }
  }

  function openProfile(user: User) {
    setSelectedId(user.id); setMessage(""); setError(""); setView("mypage");
  }

  return (
    <section className="user-mfe">
      <div className="user-heading"><div><span>ACCOUNT</span><h2>User center</h2></div><strong>{users.length} active</strong></div>
      <nav className="user-tabs" aria-label="User features">
        <button className={view === "signup" ? "active" : ""} onClick={() => setView("signup")}>Sign up</button>
        <button className={view === "members" ? "active" : ""} onClick={() => setView("members")}>Members</button>
        <button className={view === "mypage" ? "active" : ""} onClick={() => setView("mypage")}>My page</button>
      </nav>
      {message && <p className="user-message">{message}</p>}
      {error && <p className="user-error">{error}</p>}
      {view === "signup" && (
        <form className="account-card signup-form" onSubmit={signUp}>
          <div><span className="eyebrow">CREATE ACCOUNT</span><h3>Start learning English</h3><p>Create a learner profile with your name and email.</p></div>
          <label>Name<input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
          <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <button className="primary-action" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        </form>
      )}
      {view === "members" && (
        <div className="user-list">
          {users.length === 0 && !error && <div className="empty-state"><strong>No learners yet</strong><p>Create the first account from Sign up.</p></div>}
          {users.map((user) => <button className="member-row" key={user.id} onClick={() => openProfile(user)}><span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><time>{new Date(user.createdAt).toLocaleDateString()}</time></button>)}
        </div>
      )}
      {view === "mypage" && (selectedUser ? (
        <div className="account-card profile-card">
          <div className="profile-top"><span className="avatar large">{selectedUser.name.slice(0, 2).toUpperCase()}</span><div><span className="eyebrow">MY PAGE</span><h3>{selectedUser.name}</h3><p>{selectedUser.email}</p></div></div>
          <dl><div><dt>Member ID</dt><dd>{selectedUser.id}</dd></div><div><dt>Joined</dt><dd>{new Date(selectedUser.createdAt).toLocaleString()}</dd></div></dl>
          <button className="danger-action" disabled={busy} onClick={() => void withdraw()}>{busy ? "Deleting…" : "Delete account"}</button>
        </div>
      ) : <div className="empty-state"><strong>Select your profile</strong><p>Open Members and choose an account to view My page.</p><button onClick={() => setView("members")}>Open members</button></div>)}
    </section>
  );
}


