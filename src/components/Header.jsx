import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { logout } from "../services/authService";
import { getMyInvites, acceptInvite, rejectInvite } from "../services/inviteService";

export default function Header() {
  const user = auth.currentUser;
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    async function loadInvites() {
      try { setInvites(await getMyInvites()); } catch (err) { console.error(err); }
    }
    loadInvites();

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
    };
    const handleInstalled = () => setDeferredInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const result = await deferredInstallPrompt.userChoice;
      if (result.outcome === "accepted") setDeferredInstallPrompt(null);
      return;
    }
    setShowInstallHelp(true);
  }

  async function handleLogout() {
    if (!confirm("確定要登出嗎？")) return;
    localStorage.removeItem("travelmate-trips");
    await logout();
  }

  async function handleAccept(invite) {
    await acceptInvite(invite);
    setInvites((current) => current.filter((item) => item.id !== invite.id));
    alert("已加入共同旅程！");
  }

  async function handleReject(invite) {
    await rejectInvite(invite.id);
    setInvites((current) => current.filter((item) => item.id !== invite.id));
  }

  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  return (
    <header className="relative mb-6 overflow-hidden rounded-[2rem] bg-[#eef6ff] shadow-sm">
      <div className="absolute inset-0 bg-[url('/home-hero.svg')] bg-cover bg-center opacity-95" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/65 to-white/5" aria-hidden="true" />
      <div className="relative px-5 pb-6 pt-5 sm:px-7 sm:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="pt-1">
            <p className="text-sm font-semibold tracking-wide text-slate-500">こんにちは 👋</p>
            <h1 className="mt-1 text-[2.15rem] font-black tracking-tight text-slate-950 sm:text-5xl">行程規劃</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">每一次旅行，都是新的故事 ✨</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setOpen(open === "invite" ? false : "invite")} className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl shadow-md ring-1 ring-slate-100" aria-label="通知">
                🔔
                {invites.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{invites.length}</span>}
              </button>
              {open === "invite" && (
                <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-100">
                  <div className="mb-4 text-lg font-bold text-slate-900">邀請通知</div>
                  {invites.length === 0 ? <div className="py-6 text-center text-sm text-slate-400">沒有新的邀請</div> : invites.map((invite) => (
                    <div key={invite.id} className="mb-3 rounded-xl border border-slate-100 p-3 last:mb-0">
                      <div className="font-semibold text-slate-800">{invite.tripTitle}</div>
                      <div className="mt-1 text-sm text-slate-500">{invite.ownerEmail}</div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleAccept(invite)} className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white">接受</button>
                        <button onClick={() => handleReject(invite)} className="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-semibold text-slate-600">拒絕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button type="button" onClick={() => setOpen(open === "user" ? false : "user")} className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-md" aria-label="帳號">
                {user?.displayName?.charAt(0) || "👤"}
              </button>
              {open === "user" && (
                <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-100">
                  <div className="font-bold text-slate-900">{user?.displayName}</div>
                  <div className="mt-1 break-all text-sm text-slate-500">{user?.email}</div>
                  <div className="mt-4 border-t pt-4">
                    <button onClick={handleLogout} className="w-full rounded-xl bg-red-500 py-2 font-semibold text-white">🚪 登出</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button type="button" onClick={handleInstall} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-blue-600 shadow-sm ring-1 ring-blue-100 backdrop-blur hover:bg-white">
          <span className="text-base">📲</span><span>加入主畫面</span>
        </button>
      </div>

      {showInstallHelp && (
        <div className="relative border-t border-white/70 bg-white/90 px-5 py-4 text-sm text-slate-600 backdrop-blur sm:px-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">加入主畫面</div>
              {isIOS ? <p className="mt-1">請點 Safari 的「分享」→「加入主畫面」。加入後就能像 App 一樣從主畫面開啟。</p> : <p className="mt-1">目前瀏覽器沒有提供直接安裝視窗，請從瀏覽器選單選擇「安裝行程規劃」或「加入主畫面」。</p>}
            </div>
            <button type="button" onClick={() => setShowInstallHelp(false)} className="text-lg text-slate-400" aria-label="關閉">×</button>
          </div>
        </div>
      )}
    </header>
  );
}
