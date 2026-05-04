import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference * (1 - countdown / 8);

  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black text-white/[0.025] leading-none">
          404
        </div>
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-app-accent-primary/3 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-app-accent-primary/2 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Icon */}
        <div className="w-20 h-20 flex items-center justify-center bg-app-accent-primary/8 border border-app-accent-primary/15 rounded-3xl mb-6">
          <i className="ri-map-pin-line text-app-accent-primary text-3xl" />
        </div>

        {/* Title */}
        <h1 className="text-white font-black text-5xl mb-2 tracking-tight">404</h1>
        <p className="text-white/70 font-semibold text-lg mb-2">Trang không t?n t?i</p>
        <p className="text-app-text-muted text-sm mb-2 font-mono bg-app-card/50 px-3 py-1.5 rounded-lg border border-app-border max-w-xs truncate">
          {location.pathname}
        </p>
        <p className="text-app-text-muted text-sm mb-8">
          Trang này chua du?c t?o ho?c du?ng d?n không dúng
        </p>

        {/* Countdown ring + button */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Countdown circle */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="3"
              />
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="app-accent-primary"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="text-app-accent-primary font-bold text-lg relative z-10">{countdown}</span>
          </div>
          <p className="text-app-text-muted text-xs">T? d?ng v? trang ch? sau {countdown}s</p>

          {/* Buttons */}
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-app-border text-white/50 text-sm font-medium cursor-pointer hover:bg-app-card/50 hover:text-white/70 transition-all whitespace-nowrap"
            >
              <i className="ri-arrow-left-line" />
              Quay l?i
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-app-accent-primary hover:bg-app-accent-primary/80 text-app-bg text-sm font-bold cursor-pointer transition-all whitespace-nowrap"
            >
              <i className="ri-home-4-line" />
              Trang ch?
            </button>
          </div>

          {/* Quick links */}
          <div className="w-full mt-2">
            <p className="text-app-text-muted text-xs mb-3">Ho?c d?n nhanh:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: "Melon Chart", icon: "ri-music-2-line", path: "/melon" },
                { label: "EPS", icon: "ri-book-open-line", path: "/eps" },
                { label: "T? di?n", icon: "ri-search-line", path: "/dictionary" },
                { label: "Ng? pháp", icon: "ri-file-list-3-line", path: "/grammar" },
                { label: "Flashcard", icon: "ri-stack-line", path: "/flashcard-hub" },
                { label: "C?ng d?ng", icon: "ri-group-line", path: "/community" },
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-app-surface/50 border border-white/6 hover:bg-white/6 hover:border-white/12 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className={`${link.icon} text-app-text-muted group-hover:text-app-accent-primary text-base transition-colors`} />
                  </div>
                  <span className="text-app-text-muted group-hover:text-white/60 text-[10px] font-medium transition-colors whitespace-nowrap">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

