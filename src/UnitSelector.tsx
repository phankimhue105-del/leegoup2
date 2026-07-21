/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Unit } from "../types";
import { BookOpen, CheckCircle, Flame } from "lucide-react";

interface UnitSelectorProps {
  units: Unit[];
  activeUnitId: string;
  completedUnits: string[];
  onSelectUnit: (unitId: string) => void;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  units,
  activeUnitId,
  completedUnits,
  onSelectUnit
}) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 shadow-sm" id="leego-unit-selector">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
          <BookOpen size={18} />
        </div>
        <h2 className="font-black text-slate-800 text-md tracking-tight">
          Chọn Bài Học
        </h2>
      </div>

      {/* Grid on mobile, stack on desktop */}
      <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-2 md:pb-0 scrollbar-none">
        {units.map((unit, index) => {
          const isActive = unit.id === activeUnitId;
          const isCompleted = completedUnits.includes(unit.id);
          
          return (
            <button
              key={unit.id}
              onClick={() => onSelectUnit(unit.id)}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl text-left border-2 transition-all duration-200 min-w-[200px] md:min-w-0 w-auto md:w-full select-none
                ${isActive 
                  ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-400 shadow-sm shadow-orange-100/50" 
                  : "bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              id={`unit-btn-${unit.id}`}
            >
              {/* Unit number index or icon */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors
                ${isActive 
                  ? "bg-orange-500 text-white" 
                  : "bg-slate-100 text-slate-500"
                }`}
              >
                {index === 0 ? "★" : index}
              </div>

              {/* Title & description */}
              <div className="flex-1 min-w-0">
                <p className={`font-extrabold text-sm truncate leading-tight
                  ${isActive ? "text-orange-900" : "text-slate-700"}`}
                >
                  {unit.title}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                  {unit.subtitle}
                </p>
              </div>

              {/* Status indicators */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle size={16} className="text-emerald-500 fill-emerald-50" />
                ) : isActive ? (
                  <Flame size={16} className="text-orange-500 animate-pulse" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
