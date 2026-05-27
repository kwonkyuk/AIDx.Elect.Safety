import React from "react";

interface FormulaRendererProps {
  latex: string;
}

export const FormulaRenderer: React.FC<FormulaRendererProps> = ({ latex }) => {
  // Normalize spacing to make matches robust
  const normalized = latex.replace(/\s+/g, " ").trim();

  // Unit 1 Formulas
  if (normalized.includes("1 \\text{ N}") || normalized.includes("kg} \\cdot \\text{m/s}^2")) {
    return (
      <div className="flex items-center justify-center font-serif text-lg md:text-xl text-yellow-300 gap-1 select-all py-1">
        <span>1 N</span>
        <span className="mx-2 text-slate-400">=</span>
        <span>1 kg</span>
        <span className="mx-1 text-slate-400">·</span>
        <div className="flex flex-col items-center inline-flex mx-1 leading-none">
          <span className="border-b border-yellow-300/60 pb-0.5 px-1 text-sm">m</span>
          <span className="pt-0.5 text-sm">s²</span>
        </div>
      </div>
    );
  }

  if (normalized.includes("1 \\text{ J}") || normalized.includes("kg} \\cdot \\text{m}^2")) {
    return (
      <div className="flex items-center justify-center font-serif text-lg md:text-xl text-yellow-300 gap-1 select-all py-1">
        <span>1 J</span>
        <span className="mx-2 text-slate-400">=</span>
        <span>1 N · m</span>
        <span className="mx-2 text-slate-400">=</span>
        <span>1 kg</span>
        <span className="mx-1 text-slate-400">·</span>
        <div className="flex flex-col items-center inline-flex mx-1 leading-none">
          <span className="border-b border-yellow-300/60 pb-0.5 px-1 text-sm">m²</span>
          <span className="pt-0.5 text-sm">s²</span>
        </div>
      </div>
    );
  }

  // Unit 2 Formulas
  if (normalized.includes("I = \\frac{V}{R}")) {
    return (
      <div className="flex items-center justify-center font-serif text-lg md:text-xl text-yellow-300 gap-1 select-all py-1">
        <span className="italic text-yellow-300">I</span>
        <span className="mx-2 text-slate-400">=</span>
        <div className="flex flex-col items-center inline-flex mx-1 leading-none">
          <span className="border-b border-yellow-300/60 pb-0.5 px-2 text-sm italic py-0.5">V</span>
          <span className="pt-0.5 text-sm italic">R</span>
        </div>
        <span className="mx-3 text-base text-slate-500">⟹</span>
        <span className="italic text-yellow-300">V</span>
        <span className="mx-1.5 text-slate-400">=</span>
        <span className="italic text-yellow-300">I</span>
        <span className="mx-1 text-slate-400">·</span>
        <span className="italic text-yellow-300">R</span>
      </div>
    );
  }

  if (normalized.includes("H = 0.24 \\cdot I^2")) {
    return (
      <div className="flex items-center justify-center font-serif text-lg md:text-xl text-yellow-300 gap-1 select-all py-1">
        <span className="italic text-yellow-300">H</span>
        <span className="mx-2 text-slate-400">=</span>
        <span>0.24</span>
        <span className="mx-1 text-slate-400">·</span>
        <span className="italic text-yellow-300">I</span><sup className="text-xs -top-2">2</sup>
        <span className="mx-1 text-slate-400">·</span>
        <span className="italic text-yellow-300">R</span>
        <span className="mx-1 text-slate-400">·</span>
        <span className="italic text-yellow-300">t</span>
        <span className="ml-2 text-sm text-yellow-400/80 font-sans font-bold">[cal]</span>
      </div>
    );
  }

  // Unit 3 Formulas
  if (normalized.includes("I_{\\text{vf}} = \\frac{165}")) {
    return (
      <div className="flex items-center justify-center font-serif text-lg md:text-xl text-yellow-300 gap-1 select-all py-1">
        <span className="italic text-yellow-300">I</span><sub className="text-xs -bottom-1 font-sans">vf</sub>
        <span className="mx-2 text-slate-400">=</span>
        <div className="flex flex-col items-center inline-flex mx-1 leading-none">
          <span className="border-b border-yellow-300/60 pb-0.5 px-3 text-sm">165</span>
          <span className="pt-0.5 text-sm flex items-center gap-0.5">
            <span className="font-sans leading-none text-slate-400">√</span>
            <span className="italic">t</span>
          </span>
        </div>
        <span className="ml-2 text-sm text-yellow-400/80 font-sans font-bold">[mA]</span>
      </div>
    );
  }

  if (normalized.includes("W = I^2 \\cdot R \\cdot t =") || normalized.includes("27.2 \\text{ [J]}")) {
    return (
      <div className="flex items-center justify-center font-serif text-sm md:text-base text-yellow-300 gap-0.5 select-all py-1 flex-wrap leading-none">
        <span className="italic">W</span>
        <span className="mx-1 text-slate-400">=</span>
        <span className="italic">I</span><sup className="text-xs -top-1">2</sup>
        <span className="mx-0.5 text-slate-400">·</span>
        <span className="italic">R</span>
        <span className="mx-0.5 text-slate-400">·</span>
        <span className="italic">t</span>
        <span className="mx-1 text-slate-400">=</span>
        <span className="text-lg font-light scale-y-125 mx-0.5 text-slate-500">(</span>
        <div className="flex flex-col items-center inline-flex mx-0.5 leading-none">
          <span className="border-b border-yellow-300/40 pb-0.5 px-2 text-xs">165</span>
          <span className="pt-0.5 text-xs flex items-center gap-0.5">
            <span className="font-sans leading-none text-slate-500">√</span>
            <span className="italic">t</span>
          </span>
        </div>
        <span className="text-lg font-light scale-y-125 mx-0.5 text-slate-500">)</span><sup className="text-xs -top-1">2</sup>
        <span className="mx-0.5 text-slate-400">·</span>
        <span>1000</span>
        <span className="mx-0.5 text-slate-400">·</span>
        <span className="italic">t</span>
        <span className="mx-1 text-slate-400">=</span>
        <span className="font-bold">27.2</span>
        <span className="ml-1 text-xs text-yellow-400/80 font-sans font-bold">[J]</span>
      </div>
    );
  }

  // Unit 10 Formulas
  if (normalized.includes("W = \\frac{1}{2} C")) {
    return (
      <div className="flex items-center justify-center font-serif text-lg md:text-xl text-yellow-300 gap-1 select-all py-1">
        <span className="italic">W</span>
        <span className="mx-2 text-slate-400">=</span>
        <div className="flex flex-col items-center inline-flex mx-1 leading-none">
          <span className="border-b border-yellow-300/60 pb-0.5 px-2 text-sm">1</span>
          <span className="pt-0.5 text-sm">2</span>
        </div>
        <span className="italic">C</span>
        <span className="mx-0.5 text-slate-400">·</span>
        <span className="italic">V</span><sup className="text-xs -top-2">2</sup>
        <span className="ml-2 text-sm text-yellow-400/80 font-sans font-bold">[J]</span>
      </div>
    );
  }

  if (normalized.includes("W \\ge \\text{MIE}")) {
    return (
      <div className="flex items-center justify-center font-serif text-base md:text-lg text-yellow-300 gap-1 select-all py-1">
        <span className="italic">W</span>
        <span className="mx-2 text-slate-400">≥</span>
        <span className="font-sans font-bold text-xs bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-400/30">MIE</span>
        <span className="mx-2.5 text-slate-500">⟹</span>
        <span className="font-sans font-black text-[10px] bg-red-600 text-white px-2 py-0.5 rounded border border-red-500 tracking-wide uppercase shadow-sm">Explosion</span>
      </div>
    );
  }

  // Unit 14 Formulas
  if (normalized.includes("I_g = I_{gr} + j I_{gc}") || normalized.includes("I_{gr} + j I_{gc}")) {
    return (
      <div className="flex items-center justify-center font-serif text-lg md:text-xl text-yellow-300 gap-1 select-all py-1">
        <span className="italic">I</span><sub className="text-xs -bottom-1">g</sub>
        <span className="mx-2 text-slate-400">=</span>
        <span className="italic">I</span><sub className="text-xs -bottom-1 font-sans">gr</sub>
        <span className="mx-2 text-slate-400">+</span>
        <span className="italic">j</span>
        <span className="italic">I</span><sub className="text-xs -bottom-1 font-sans">gc</sub>
      </div>
    );
  }

  if (normalized.includes("\\hat{x}_{k|k} =") || normalized.includes("K_k \\left(")) {
    return (
      <div className="flex items-center justify-center font-serif text-sm md:text-base text-yellow-300 gap-0.5 select-all py-1 flex-wrap leading-none">
        <span className="relative inline-block mr-0.5">
          <span className="absolute -top-1.5 left-0.5 text-[10px] text-yellow-400">^</span>
          <span className="italic">x</span>
        </span><sub className="text-xs -bottom-0.5">k|k</sub>
        <span className="mx-1 text-slate-400">=</span>
        <span className="relative inline-block mr-0.5">
          <span className="absolute -top-1.5 left-0.5 text-[10px] text-yellow-400">^</span>
          <span className="italic">x</span>
        </span><sub className="text-xs -bottom-0.5">k|k-1</sub>
        <span className="mx-1 text-slate-400">+</span>
        <span className="italic">K</span><sub className="text-xs -bottom-0.5">k</sub>
        <span className="text-lg font-light scale-y-125 mx-1 text-slate-500">(</span>
        <span className="italic">z</span><sub className="text-xs -bottom-0.5">k</sub>
        <span className="mx-1 text-slate-400">-</span>
        <span className="italic">H</span><sub className="text-xs -bottom-0.5">k</sub>
        <span className="relative inline-block mx-0.5">
          <span className="absolute -top-1.5 left-0.5 text-[10px] text-yellow-400">^</span>
          <span className="italic">x</span>
        </span><sub className="text-xs -bottom-0.5 font-sans">k|k-1</sub>
        <span className="text-lg font-light scale-y-125 mx-1 text-slate-500">)</span>
      </div>
    );
  }

  // Fallback nicely to a styled italic monospace math representation if no match
  return (
    <span className="text-yellow-400 font-mono text-base md:text-lg font-semibold block italic tracking-wide">
      {latex}
    </span>
  );
};
