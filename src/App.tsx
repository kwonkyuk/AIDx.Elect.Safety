import React, { useState, useEffect } from "react";
import { 
  Cpu, GraduationCap, Calendar, Compass, MessageSquare, 
  CheckCircle, User, Award, BookOpen, AlertCircle, Sparkles, Activity, Bot
} from "lucide-react";
import { curriculumData } from "./curriculum";
import { WeekContent } from "./components/WeekContent";
import { AIdxtutor } from "./components/AIdxtutor";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("unit1");
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([1]); // Default week 1 done
  const [askedQuestionsCount, setAskedQuestionsCount] = useState<number>(0);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(true); // AI Tutor default is open!

  // Load progress states on initiation
  useEffect(() => {
    const saved = localStorage.getItem("completed_weeks");
    if (saved) {
      setCompletedWeeks(JSON.parse(saved));
    }
  }, []);

  const toggleCompleteWeek = (weekId: number) => {
    setCompletedWeeks((prev) => {
      const next = prev.includes(weekId)
        ? prev.filter((id) => id !== weekId)
        : [...prev, weekId];
      localStorage.setItem("completed_weeks", JSON.stringify(next));
      return next;
    });
  };

  const activeChapter = curriculumData.find((ch) => ch.slug === activeTab) || curriculumData[0];

  const getWeekThemeStyles = (theme: string) => {
    switch (theme) {
      case "blue": return { border: "border-blue-600", text: "text-blue-600", bg: "bg-blue-50" };
      case "yellow": return { border: "border-amber-600", text: "text-amber-700", bg: "bg-amber-50" };
      case "red": return { border: "border-red-600", text: "text-red-700", bg: "bg-red-50" };
      case "green": return { border: "border-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50" };
      case "indigo": return { border: "border-indigo-600", text: "text-indigo-700", bg: "bg-indigo-50" };
      case "purple": return { border: "border-purple-600", text: "text-purple-700", bg: "bg-purple-50" };
      case "teal": return { border: "border-teal-600", text: "text-teal-700", bg: "bg-teal-50" };
      case "rose": return { border: "border-rose-600", text: "text-rose-700", bg: "bg-rose-50" };
      case "cyan": return { border: "border-cyan-600", text: "text-cyan-700", bg: "bg-cyan-50" };
      case "emerald": return { border: "border-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50" };
      case "fuchsia": return { border: "border-fuchsia-600", text: "text-fuchsia-700", bg: "bg-fuchsia-50" };
      case "amber": return { border: "border-amber-600", text: "text-amber-700", bg: "bg-amber-50" };
      case "sky": return { border: "border-sky-600", text: "text-sky-700", bg: "bg-sky-50" };
      case "orange": return { border: "border-orange-600", text: "text-orange-700", bg: "bg-orange-50" };
      default: return { border: "border-slate-600", text: "text-slate-700", bg: "bg-slate-100" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* 1. Academic High Density Header */}
      <header className="bg-slate-900 text-white flex items-center justify-between px-6 py-4 border-b-4 border-blue-500 flex-shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg italic text-white shadow-md">DS</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              AI.DX 전기안전 원격학습 플랫폼 <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">University Portal</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Industrial Safety Management Department • DIST Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-100">지도교수: Prof.YUKWON</p>
            <p className="text-xs text-blue-400 font-semibold">AI.DX 전기안전 실험연구실</p>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
          {/* AI Tutor Slide Switch Toggle */}
          <div 
            onClick={() => setIsTutorOpen(!isTutorOpen)}
            className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3.5 py-1.5 rounded-full select-none cursor-pointer transition-colors shadow-inner"
            title="AI 튜터 켜기/끄기"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black text-slate-200 tracking-tight">AI 튜터</span>
            <div className="relative inline-flex items-center">
              <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${isTutorOpen ? 'bg-blue-500' : 'bg-slate-650'} relative`}>
                <div className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${isTutorOpen ? 'translate-x-[16px]' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">주차 달성률 ({completedWeeks.length} / 15)</span>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden border border-slate-700">
              <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${(completedWeeks.length / 15) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Primary University Dashboard grid layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Drawer / Dashboard (Weeks Navigation) */}
        <aside className="lg:col-span-1 space-y-6 print:hidden">
          {/* Semester progress card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-500" /> 나의 학습 진행상황
              </h4>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {Math.round((completedWeeks.length / 15) * 100)} %
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(completedWeeks.length / 15) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5 font-bold">수료 단원</span>
                <span className="font-extrabold text-slate-800">{completedWeeks.length} / 15</span>
              </div>
              <button 
                onClick={() => toggleCompleteWeek(activeChapter.id)}
                className={`p-2 rounded-lg border transition font-bold select-none cursor-pointer ${
                  completedWeeks.includes(activeChapter.id)
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {completedWeeks.includes(activeChapter.id) ? "학습 완료됨" : "수료 등록하기"}
              </button>
            </div>
          </div>

          {/* 15 Weeks tabs navigational buttons */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-wider pl-1 block mb-2">
              전체 학습 단원 (Unit 1-15)
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {curriculumData.map((ch) => {
                const isCompleted = completedWeeks.includes(ch.id);
                const isActive = activeTab === ch.slug;
                const weekStyles = getWeekThemeStyles(ch.theme);

                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveTab(ch.slug);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`text-left p-2 rounded-lg text-[11px] font-bold transition flex flex-col justify-between border cursor-pointer h-16 ${
                      isActive 
                        ? `${weekStyles.bg} ${weekStyles.border} ${weekStyles.text}` 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {ch.id < 10 ? `0${ch.id}` : ch.id}
                      </span>
                      {isCompleted && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <span className="truncate w-full mt-1.5 text-slate-700">{ch.title.split(":")[1]?.trim() || ch.title}</span>
                  </button>
                );
              })}
            </div>
            {/* System Status Display (High Density Theme alignment) */}
            <div className="p-3 bg-slate-900 text-white rounded-xl mt-3 select-none">
              <div className="text-[9px] text-slate-400 mb-1 font-bold uppercase tracking-wider uppercase">대학 관제 상태</div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-mono text-emerald-400">AI Core Engine Active</span>
              </div>
            </div>
          </div>

          {/* Professor Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <span className="font-extrabold text-xs text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">
              교수 연구원 프로필
            </span>
            <div className="flex gap-3 items-center">
              <div className="bg-slate-100 p-2.5 rounded-full border border-slate-200 text-slate-600">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h5 className="font-black text-sm text-slate-800">Prof.YUKWON</h5>
                <p className="text-[10px] text-slate-500">배전 및 방재 지능형 관제 연구실</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg leading-relaxed border border-slate-200/50">
              <p>• <strong>오피스 시간:</strong> 목요일 14:00 - 17:00</p>
              <p>• <strong>수업 장소:</strong> 창조관 307호 멀티미디어실</p>
              <p>• <strong>연락 이메일:</strong> labkyu@naver.com</p>
            </div>
          </div>
        </aside>

        {/* Right Content Curriculum Text-book / Solvers */}
        <section className="lg:col-span-3 space-y-8 animate-fadeIn">
          {/* Main content display */}
          <WeekContent chapter={activeChapter} />
        </section>

      </div>

      {/* 3. Floating AI Tutor Component */}
      <AIdxtutor isOpen={isTutorOpen} setIsOpen={setIsTutorOpen} />

      {/* 4. Fine academic high-density footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 mt-12 print:hidden z-10 text-[10px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <span className="font-bold">PLATFORM VERSION 2.1.0-PREMIUM</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono">PORTAL TOKEN: DX-ELEC-DIST-{completedWeeks.length}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 uppercase font-bold text-[9px]">
            <span className="text-blue-600/80 tracking-widest">Industry Safety Academic Network</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>&copy; {new Date().getFullYear()} AI.DX ELECTRICAL SAFETY • DIST</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
