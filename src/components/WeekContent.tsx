import React, { useState } from "react";
import { 
  Sparkles, ClipboardCheck, BookOpen, Clock, Lightbulb, 
  Play, Download, FileText, Bot, CheckCircle, AlertTriangle,
  Flame, Zap, Compass, RotateCcw, ShieldAlert, FileImage, Loader2
} from "lucide-react";
import { WeekChapter, Quiz, Checklist } from "../types";
import { FormulaRenderer } from "./FormulaRenderer";

interface WeekContentProps {
  chapter: WeekChapter;
}

export function WeekContent({ chapter }: WeekContentProps) {
  // AI states
  const [summary, setSummary] = useState<string[] | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  
  const [scenarioInput, setScenarioInput] = useState("");
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [isChecklistLoading, setIsChecklistLoading] = useState(false);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isAnswersChecked, setIsAnswersChecked] = useState(false);

  // Vision File state
  const [imageName, setImageName] = useState("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("");
  const [visionAnalysis, setVisionAnalysis] = useState<string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);

  // 1. Joule / Ohm local simulator states
  const [simVoltage, setSimVoltage] = useState(220);
  const [simResistance, setSimResistance] = useState(500); // 인체저항 등
  const simCurrent = Number((simVoltage / simResistance).toFixed(3)); // A
  const simHeat = Number((0.24 * Math.pow(simCurrent, 2) * simResistance * 1).toFixed(2)); // cal/1sec

  // 2. Dalziel local simulator states
  const [dalzielTime, setDalzielTime] = useState(1); // sec
  const dalzielLimit = Number((165 / Math.sqrt(dalzielTime)).toFixed(2)); // mA

  // 3. Static MIE spark ignition states
  const [staticC, setStaticC] = useState(150); // pF
  const [staticV, setStaticV] = useState(5000); // V
  const staticEnergy = Number((0.5 * (staticC * 1e-12) * Math.pow(staticV, 2) * 1000).toFixed(3)); // mJ
  const combustibleGases = [
    { name: "수소 (Hydrogen)", mie: 0.019 },
    { name: "에틸렌 (Ethylene)", mie: 0.07 },
    { name: "메탄 (Methane)", mie: 0.28 },
    { name: "프로판 (Propane)", mie: 0.25 }
  ];
  const [selectedGasIdx, setSelectedGasIdx] = useState(0);
  const currentGas = combustibleGases[selectedGasIdx];
  const staticExploded = staticEnergy >= currentGas.mie;

  // Actions
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummary(null);
    try {
      const lectureBlob = chapter.lectureNotebook.join(" ");
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `교안 내용: [${lectureBlob}]\n이 내용을 대학생 수준에서 기억하기 쉽도록 딱 3줄 요약 문장의 리스트로 정리해다오. 다른 말은 덧붙이지 마라.`
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error);
      }
      const data = await res.json();
      const lines = data.text.split("\n").filter((l: string) => l.trim().length > 0).slice(0, 3);
      setSummary(lines);
    } catch (err: any) {
      console.error(err);
      setSummary([err.message || "AI 튜터 통신 서버가 붐비고 있네요. 잠시(2~3초) 후에 다시 시도해 주세요!"]);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleGenerateChecklist = async () => {
    const s = scenarioInput.trim();
    if (!s) return;
    setIsChecklistLoading(true);
    setChecklist(null);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: s })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error);
      }
      const data = await res.json();
      setChecklist(data);
    } catch (err: any) {
      console.error(err);
      setChecklist({
        title: "점검표 기획 오류",
        items: [
          err.message || "AI 튜터 통신 서버가 붐비고 있네요. 잠시(2~3초) 후에 다시 시도해 주세요!"
        ]
      });
    } finally {
      setIsChecklistLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsQuizLoading(true);
    setQuiz(null);
    setSelectedQuizOption(null);
    setIsAnswersChecked(false);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: chapter.title })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error);
      }
      const data = await res.json();
      setQuiz(data);
    } catch (err: any) {
      console.error(err);
      setQuiz({
        question: "평가 문항 출제 네트워크 장애\n\n" + (err.message || "AI 튜터 통신 서버가 붐비고 있네요. 잠시(2~3초) 후에 다시 시도해 주세요!"),
        answer: "①",
        explanation: "나중에 다시 문항을 시험해 보거라."
      });
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleVisionImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        setBase64Image(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeVision = async () => {
    if (!base64Image) return;
    setIsVisionLoading(true);
    setVisionAnalysis(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image, mimeType })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error);
      }
      const data = await res.json();
      setVisionAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setVisionAnalysis(err.message || "AI 튜터 통신 서버가 붐비고 있네요. 잠시(2~3초) 후에 다시 시도해 주세요!");
    } finally {
      setIsVisionLoading(false);
    }
  };

  const exportToDoc = () => {
    const content = document.getElementById(`print-area-${chapter.id}`)?.innerHTML || "";
    const sourceHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${chapter.title}</title></head><body style="font-family: 'Malgun Gothic', sans-serif;">${content}</body></html>`;
    const uri = "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(sourceHTML);
    const link = document.createElement("a");
    link.href = uri;
    link.download = `${chapter.slug}_강의노트.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = () => {
    window.print(); // Falls back nicely to system print
  };

  // Color theme mapper
  const getThemeColor = (type: string) => {
    switch (type) {
      case "blue": return { border: "border-blue-500", text: "text-blue-600", bg: "bg-blue-50", fill: "bg-blue-600", btn: "hover:bg-blue-50" };
      case "yellow": return { border: "border-amber-500", text: "text-amber-600", bg: "bg-amber-50", fill: "bg-amber-500", btn: "hover:bg-amber-50" };
      case "red": return { border: "border-red-500", text: "text-red-600", bg: "bg-red-50", fill: "bg-red-600", btn: "hover:bg-red-50" };
      case "green": return { border: "border-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", fill: "bg-emerald-600", btn: "hover:bg-emerald-50" };
      case "indigo": return { border: "border-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50", fill: "bg-indigo-600", btn: "hover:bg-indigo-50" };
      case "purple": return { border: "border-purple-500", text: "text-purple-600", bg: "bg-purple-50", fill: "bg-purple-600", btn: "hover:bg-purple-50" };
      case "teal": return { border: "border-teal-500", text: "text-teal-600", bg: "bg-teal-50", fill: "bg-teal-600", btn: "hover:bg-teal-50" };
      case "rose": return { border: "border-rose-500", text: "text-rose-600", bg: "bg-rose-50", fill: "bg-rose-600", btn: "hover:bg-rose-50" };
      case "cyan": return { border: "border-cyan-500", text: "text-cyan-600", bg: "bg-cyan-50", fill: "bg-cyan-600", btn: "hover:bg-cyan-50" };
      case "emerald": return { border: "border-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", fill: "bg-emerald-600", btn: "hover:bg-emerald-50" };
      case "fuchsia": return { border: "border-fuchsia-500", text: "text-fuchsia-600", bg: "bg-fuchsia-50", fill: "bg-fuchsia-600", btn: "hover:bg-fuchsia-50" };
      case "amber": return { border: "border-amber-500", text: "text-amber-600", bg: "bg-amber-50", fill: "bg-amber-500", btn: "hover:bg-amber-50" };
      case "sky": return { border: "border-sky-500", text: "text-sky-600", bg: "bg-sky-50", fill: "bg-sky-600", btn: "hover:bg-sky-50" };
      case "orange": return { border: "border-orange-500", text: "text-orange-600", bg: "bg-orange-50", fill: "bg-orange-600", btn: "hover:bg-orange-50" };
      default: return { border: "border-slate-500", text: "text-slate-600", bg: "bg-slate-50", fill: "bg-slate-600", btn: "hover:bg-slate-100" };
    }
  };

  const activeColor = getThemeColor(chapter.theme);

  return (
    <div className="space-y-12">
      {/* 0. Chapter Title Layout */}
      <div className={`${activeColor.bg} border-l-4 ${activeColor.border} p-8 rounded-r-2xl text-justify relative shadow-sm`}>
        <div className="absolute top-4 right-4 flex gap-2 z-10 print:hidden">
          <button
            onClick={exportToDoc}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" /> Word 저장
          </button>
          <button
            onClick={exportToPdf}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" /> PDF 인쇄
          </button>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{chapter.title}</h2>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-extrabold mb-4">{chapter.subtitle}</p>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{chapter.description}</p>
      </div>

      <div id={`print-area-${chapter.id}`} className="space-y-12">
        {/* 1. Learning Objectives */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-500" /> 금주 핵심 학습 목표
          </h3>
          <ul className="space-y-2.5">
            {chapter.learningObjectives.map((obj, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed text-justify">
                <span className="font-extrabold text-indigo-600 min-w-[20px]">{i + 1}.</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Lecture Textbook Blocks */}
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5.5 h-5.5 text-slate-800" /> 교수 설계 강의록 (Lecture Notes)
          </h3>
          {chapter.lectureNotebook.map((block, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 text-sm text-slate-600 text-justify leading-relaxed">
              {block}
            </div>
          ))}
        </div>

        {/* 3. Equations section if present */}
        {chapter.equations && chapter.equations.length > 0 && (
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-inner space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" /> 지배 물리 방정식 (Core Formula)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
              {chapter.equations.map((eq, i) => (
                <div key={i} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-center text-center min-h-[90px] shadow-sm">
                  <div className="mb-2">
                    <FormulaRenderer latex={eq.latex} />
                  </div>
                  <span className="text-xs text-slate-400 font-medium font-sans">{eq.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CONTEXTUAL INTERACTIVE SIMULATORS (University UI Style) */}
        {chapter.id === 2 && (
          <div className="bg-white p-6 rounded-2xl border-2 border-yellow-200/80 shadow-md space-y-6">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Flame className="w-6 h-6 text-amber-500 animate-bounce" /> [시뮬레이터 1] Joule's Law 및 과부하 연소 수치 분석기
            </h4>
            <p className="text-xs text-slate-500 text-justify leading-relaxed">
              전압과 인체 혹은 설비 저항을 조절해 보거라. 전류가 증가함에 따라 전선 피복에 가해지는 주울 발열량이 '제곱 비례'하여 얼마나 기하급수적으로 위험해지는지 모의할 수 있단다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1 flex justify-between">
                    <span>전압 (Voltage)</span>
                    <span className="font-mono text-indigo-600">{simVoltage} V</span>
                  </label>
                  <input 
                    type="range" min="110" max="380" step="10" 
                    value={simVoltage} onChange={(e) => setSimVoltage(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1 flex justify-between">
                    <span>회로 저항 (Resistance)</span>
                    <span className="font-mono text-indigo-600">{simResistance} Ω</span>
                  </label>
                  <input 
                    type="range" min="50" max="5000" step="50" 
                    value={simResistance} onChange={(e) => setSimResistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-xl flex flex-col justify-center text-center space-y-3 shadow-inner">
                <div>
                  <span className="text-xs text-slate-400 block">계산된 부하 전류 (Current)</span>
                  <span className="font-mono text-xl font-bold text-yellow-400">{simCurrent} A</span>
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-xs text-slate-400 block">초당 발생하는 주울 마찰 열량 (Joule Heat)</span>
                  <span className={`font-mono text-2xl font-black block ${simHeat > 5.0 ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
                    {simHeat} cal/sec
                  </span>
                  {simHeat > 5.0 && (
                    <span className="text-[10px] text-red-400 font-bold block mt-1 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> 위험: 전선 인출 파열 및 피복 연소 징후!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {chapter.id === 3 && (
          <div className="bg-white p-6 rounded-2xl border-2 border-red-200/80 shadow-md space-y-6">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" /> [시뮬레이터 2] Dalziel 심실세동 안전 한계선 추정기
            </h4>
            <p className="text-xs text-slate-500 text-justify">
              통전 시간(초)을 늘리거나 줄여 보거라. 감전 사고 발생 시 인체가 견딜 수 있는 세동전류 한계가 얼마나 고속으로 붕괴되는지 규명해 보거라.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1 flex justify-between">
                    <span>인체 통전 지속시간 (Time)</span>
                    <span className="font-mono text-red-600">{dalzielTime} 초 (sec)</span>
                  </label>
                  <input 
                    type="range" min="0.03" max="3" step="0.05" 
                    value={dalzielTime} onChange={(e) => setDalzielTime(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-xl flex flex-col justify-center text-center space-y-2">
                <span className="text-xs text-slate-400 block">심실세동 유발 치사 한계전류량 (Dalziel Limit)</span>
                <span className="font-mono text-3xl font-black text-red-500">{dalzielLimit} mA</span>
                <p className="text-[10px] text-slate-400 text-justify leading-relaxed">
                  ※ 즉, {dalzielTime}초 동안 사람이 누전에 접촉했을 경우, 단 {dalzielLimit}mA의 전류만으로도 심장 정지에 돌입하여 사망할 수 있음을 나타냅니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {chapter.id === 10 && (
          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200/80 shadow-md space-y-6">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertTriangle className="w-6 h-6 text-emerald-500" /> [시뮬레이터 3] 정전기 점화에너지 대치 방폭 시뮬레이션
            </h4>
            <p className="text-xs text-slate-500 text-justify">
              체류 중인 가스 종을 고르고 물체의 대량 정전 용량(C)과 전압(V)을 올려 보아라. 불꽃 방전 에너지인 <span className="font-serif italic font-bold">W = 0.5 · C · V²</span>이 해당 가스의 최소점화에너지(MIE)를 초과하면 폭발 임계에 도달한단다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">체류 위험 연소 가스</label>
                  <select 
                    value={selectedGasIdx} onChange={(e) => setSelectedGasIdx(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-lg p-2 outline-none"
                  >
                    {combustibleGases.map((gas, idx) => (
                      <option key={idx} value={idx}>{gas.name} (MIE: {gas.mie} mJ)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1 flex justify-between">
                    <span>인체/물체 정전용량 (C)</span>
                    <span className="font-mono text-emerald-600">{staticC} pF</span>
                  </label>
                  <input 
                    type="range" min="10" max="300" step="10" 
                    value={staticC} onChange={(e) => setStaticC(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1 flex justify-between">
                    <span>축적 전위 전압 (V)</span>
                    <span className="font-mono text-emerald-600">{staticV} V</span>
                  </label>
                  <input 
                    type="range" min="500" max="15000" step="500" 
                    value={staticV} onChange={(e) => setStaticV(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
              <div className={`p-6 rounded-xl flex flex-col justify-center text-center space-y-3 shadow-md border transition-all duration-300 ${
                staticExploded 
                  ? "bg-red-50 border-red-200 text-red-900" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}>
                <div>
                  <span className="text-xs text-slate-500 block">방전 순간 불꽃 방출 에너지 (W)</span>
                  <span className="font-mono text-2xl font-black text-slate-800">{staticEnergy} mJ</span>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500 block">선택 가스의 점화 임계 돌파 상태</span>
                  <span className={`font-mono text-xl font-bold block ${staticExploded ? "text-red-600" : "text-emerald-700"}`}>
                    {staticExploded ? "🔥 연쇄 대폭발 유폭!" : "✅ 안전 (자연 누설 상태)"}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    (가스 한계: {currentGas.mie} mJ)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {chapter.id === 13 && (
          <div className="bg-white p-6 rounded-2xl border-2 border-sky-300 shadow-md space-y-6">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Compass className="w-6 h-6 text-sky-500" /> [실무 시뮬레이터 4] 전기 화재 원인 감식 가이드
            </h4>
            <p className="text-xs text-slate-500 text-justify">
              소방 조사 과정에서 전선의 탄 흔적(용융 구슬) 사진을 판독하여 1차 단락흔(화재의 원인)과 2차 단락흔(화재의 결과)을 비교 진단해 보아라. 
              여기서 학생 사진이나 수사 구슬 이미지(base64)를 올려 교수 소견을 인공지능으로 받아 볼 수 있단다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h5 className="text-xs font-bold text-slate-700 mb-2">실무 사진 비전 감식 수거</h5>
                <div className="bg-white border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-5 text-center relative cursor-pointer transition">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleVisionImgUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileImage className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 font-bold block">클릭하여 탄화 흔적 사진 수거</span>
                  {imageName && (
                    <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                      {imageName}
                    </span>
                  )}
                </div>
                <button
                  disabled={!base64Image || isVisionLoading}
                  onClick={handleAnalyzeVision}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                >
                  {isVisionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 현미경 판독 중...
                    </>
                  ) : (
                    "🔬 AI 연합 현장 감식 소견 받기"
                  )}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-5 rounded-xl flex flex-col justify-center border border-slate-800 min-h-[180px]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                  [YUKWON 명예교수 감식 판독기 결과창]
                </span>
                <div className="text-xs leading-relaxed text-justify h-full flex items-center">
                  {visionAnalysis ? (
                    <p className="font-mono text-emerald-400 whitespace-pre-line">{visionAnalysis}</p>
                  ) : (
                    <p className="text-slate-400 font-mono italic">
                      "수거한 구리 구슬의 표면 상태와 내부 기공의 거칠기가 담긴 사진을 분석해야 원인과 결과를 구분해 줄 수 있단다."
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. AI Custom Checklist (Pragmatic integration of GEMINI SDK) */}
      <div className="bg-slate-800 text-slate-100 p-8 rounded-2xl shadow-xl space-y-5 print:hidden">
        <div className="flex items-center gap-2 text-yellow-400">
          <ClipboardCheck className="w-6 h-6 animate-pulse" />
          <h4 className="text-lg font-bold">✨ AI.DX 융합 스마트 현장 누전/발열 방재 체크리스트</h4>
        </div>
        <p className="text-xs text-slate-300 text-justify leading-relaxed">
          과제를 진행할 특별 가설 장소(예: '노후 목조 주택의 전기 보일러 정비', '습기 많은 제과 공장 콘센트 이식')를 적어 보거라. 
          그럼 인공지능 교수 설계망이 점검 대상의 주울 전선 단락, 정전기 방폭, 접지 기준 등 최적화된 5대 스마트 안전점검표를 기획해 준단다.
        </p>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={scenarioInput}
            onChange={(e) => setScenarioInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateChecklist()}
            placeholder="예: 급식소 주방 콘센트, 주유소 배관 밸브 교체 작업..."
            className="flex-1 bg-slate-700/80 border border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-500 outline-none text-white placeholder-slate-400"
          />
          <button
            onClick={handleGenerateChecklist}
            disabled={!scenarioInput.trim() || isChecklistLoading}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 text-slate-900 font-bold px-5 py-3 rounded-xl flex items-center gap-1 cursor-pointer transition whitespace-nowrap text-sm"
          >
            {isChecklistLoading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              "점검표 생성"
            )}
          </button>
        </div>

        {checklist && (
          <div className="bg-slate-700/60 p-5 rounded-xl border border-slate-600 animate-fadeIn space-y-4">
            <h5 className="font-bold text-yellow-400 text-sm flex items-center gap-2">
              📍 [{checklist.title}] 특별 예방 안전점검표
            </h5>
            <ul className="space-y-2.5">
              {checklist.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-slate-800 p-3 rounded-lg border border-slate-600">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-indigo-600 bg-slate-700 rounded border-slate-600 accent-yellow-400 cursor-pointer"
                  />
                  <span className="text-xs text-slate-200 text-justify leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 6. AI Interactive Quiz Module (Pragmatic integration of GEMINI SDK) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 print:hidden">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <CheckCircle className="w-5.5 h-5.5" />
            <h4 className="text-base font-bold">임용 및 자격증 예상 문제 은행 생성기</h4>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={isSummaryLoading}
            className={`border ${activeColor.border} ${activeColor.text} ${activeColor.btn} font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer`}
          >
            {isSummaryLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Bot className="w-4 h-4" /> 3줄 요약 받기
              </>
            )}
          </button>
        </div>

        {/* Weekly AI generated summaries */}
        {summary && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fadeIn">
            <span className="text-[10px] text-indigo-600 font-bold block mb-2">✨ 교수 요약 브리핑</span>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed text-justify">
              {summary.map((line, i) => (
                <li key={i}>{line.replace(/^-\s*/, "")}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/50 flex flex-col items-center justify-center text-center space-y-3">
          <BookOpen className="w-8 h-8 text-indigo-500" />
          <h5 className="font-bold text-sm text-slate-800">이 단원에서 배우는 핵심내용 지식 평가</h5>
          <p className="text-xs text-slate-500 max-w-md">
            한국전기설비규정(KEC), 산업안전기사 규격에 완전 밀착된 평가용 4지선다 기출 예상문제를 즉시 출제합니다.
          </p>
          <button
            onClick={handleGenerateQuiz}
            disabled={isQuizLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
          >
            {isQuizLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> AI 예상문제 출제하기
              </>
            )}
          </button>
        </div>

        {quiz && (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-indigo-600 font-bold block mb-1">Q. 기출 요건 충족 예상 문제</span>
                {/* Format the question text nicely with option alignment */}
                <div className="text-sm font-bold text-slate-800 leading-relaxed text-justify space-y-1">
                  {quiz.question.split("\n").map((line, idx) => (
                    <p key={idx} className={idx === 0 ? "mb-2" : "pl-4 text-xs font-semibold text-slate-600"}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer select triggers */}
            <div className="grid grid-cols-2 gap-2 max-w-sm pt-2">
              {["①", "②", "③", "④"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isAnswersChecked && setSelectedQuizOption(opt)}
                  disabled={isAnswersChecked}
                  className={`p-2 rounded-lg text-xs font-bold border transition text-center cursor-pointer ${
                    selectedQuizOption === opt
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  보계 {opt}
                </button>
              ))}
            </div>

            {selectedQuizOption && !isAnswersChecked && (
              <button
                onClick={() => setIsAnswersChecked(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition select-none"
              >
                제출하여 채점받기
              </button>
            )}

            {isAnswersChecked && (
              <div className={`p-4 rounded-xl border animate-fadeIn space-y-2 ${
                selectedQuizOption === quiz.answer
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-red-50 border-red-200 text-red-950"
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs">
                  {selectedQuizOption === quiz.answer ? (
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded">합격선 통과</span>
                  ) : (
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded">불합격 감점</span>
                  )}
                  <span>제출: {selectedQuizOption} | 정답: {quiz.answer}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  <strong>해설:</strong> {quiz.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
