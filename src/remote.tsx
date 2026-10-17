import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
type User = { id:string; email:string; name:string; createdAt:string };
function UserApp({apiBaseUrl}:{apiBaseUrl?:string}) { const [users,setUsers]=React.useState<User[]>([]); const [error,setError]=React.useState(""); const load=React.useCallback(()=>fetch(`${apiBaseUrl??""}/api/users`).then(r=>r.ok?r.json():Promise.reject(new Error(String(r.status)))).then((d:{users:User[]})=>setUsers(d.users)).catch((e:Error)=>setError(e.message)),[apiBaseUrl]); React.useEffect(()=>{void load()},[load]); return <section className="user-mfe"><div className="user-heading"><div><span>PEOPLE</span><h2>Learners</h2></div><strong>{users.length} active</strong></div>{error&&<p className="user-error">User API unavailable ({error}).</p>}<div className="user-list">{users.length===0&&!error&&<p>No learners yet. Create one through the User API.</p>}{users.map(u=><article key={u.id}><div className="avatar">{u.name.slice(0,2).toUpperCase()}</div><div><h3>{u.name}</h3><p>{u.email}</p></div><time>{new Date(u.createdAt).toLocaleDateString()}</time></article>)}</div></section> }
export function mount(element:HTMLElement,options:{apiBaseUrl?:string}={}) { const root=createRoot(element); root.render(<UserApp apiBaseUrl={options.apiBaseUrl}/>); return ()=>root.unmount(); }

