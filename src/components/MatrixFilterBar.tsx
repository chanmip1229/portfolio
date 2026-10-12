'use client';

import React from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import { Brand, Department, PromotionStatus } from '@/types/promotion';
import { Filter, Building2, Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const BRANDS: { value: Brand | 'ALL'; label: string; desc: string }[] = [
  { value: 'ALL', label: '전체 브랜드', desc: 'SHESMISS / LIST / SISTINA' },
  { value: 'SHESMISS', label: 'SHESMISS (쉬즈미스)', desc: '모던 & 컨템포러리' },
  { value: 'LIST', label: 'LIST (리스트)', desc: '영 캐주얼 셀렉션' },
  { value: 'SISTINA', label: 'SISTINA (시스티나)', desc: '트렌디 영 베이직' },
];

const DEPARTMENTS: { value: Department | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체 부서' },
  { value: 'MD', label: 'MD팀 (상품/가격)' },
  { value: 'DESIGN', label: '디자인팀 (배너/화보)' },
  { value: 'EBIZ_OPS', label: 'E-BIZ 운영팀 (QC/오픈)' },
];

const STATUSES: { value: PromotionStatus | 'ALL'; label: string; icon: React.ReactNode }[] = [
  { value: 'ALL', label: '전체 업무 상태', icon: null },
  { value: 'PLANNING', label: '1. 기획/등록', icon: <Clock className="w-3 h-3 text-slate-400" /> },
  { value: 'ASSET_REQUESTED', label: '2. 회신 대기 (소재 요청됨)', icon: <Clock className="w-3 h-3 text-blue-500" /> },
  { value: 'DATA_RECEIVED', label: '3. 회신 도착', icon: <CheckCircle2 className="w-3 h-3 text-indigo-500" /> },
  { value: 'NEEDS_CHECK', label: '4. 🚨 오류 재확인 필요', icon: <AlertTriangle className="w-3 h-3 text-rose-500" /> },
  { value: 'QC_PASSED', label: '5. 사전 QC 통과', icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> },
  { value: 'READY_TO_PUBLISH', label: '6. 게시 준비 완료', icon: <CheckCircle2 className="w-3 h-3 text-teal-600" /> },
];

export default function MatrixFilterBar() {
  const {
    selectedBrand,
    selectedDepartment,
    selectedStatus,
    setSelectedBrand,
    setSelectedDepartment,
    setSelectedStatus,
    promotions,
  } = useOpsStore();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-8">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <span className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
          <Filter className="w-4 h-4" />
        </span>
        <h2 className="text-sm font-bold text-slate-900">
          3-Way 멀티 필터 매트릭스 (브랜드별 / 부서별 / 업무상태별)
        </h2>
        <span className="text-xs text-slate-400 ml-auto">
          다각도로 필터링하여 병목 구간과 긴급 대응 업무를 한눈에 식별합니다.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. 브랜드별 필터 */}
        <div>
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            1. 브랜드별 관점
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BRANDS.map((b) => {
              const isSelected = selectedBrand === b.value;
              const count =
                b.value === 'ALL'
                  ? promotions.length
                  : promotions.filter((p) => p.brand === b.value).length;

              return (
                <button
                  key={b.value}
                  onClick={() => setSelectedBrand(b.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{b.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 협업 부서별 필터 */}
        <div>
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            2. 협업 부서(병목) 관점
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DEPARTMENTS.map((dept) => {
              const isSelected = selectedDepartment === dept.value;
              const count =
                dept.value === 'ALL'
                  ? promotions.length
                  : promotions.filter((p) => p.currentBottleneckDept === dept.value).length;

              return (
                <button
                  key={dept.value}
                  onClick={() => setSelectedDepartment(dept.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{dept.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 업무 상태별 필터 */}
        <div>
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            3. 업무 진행 상태 관점
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PromotionStatus | 'ALL')}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
