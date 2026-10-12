'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseExcelCalendar, createSampleCalendarTemplate } from '@/utils/calendarParser';
import { useOpsStore } from '@/store/useOpsStore';

export default function CalendarUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessCount, setUploadSuccessCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addPromotions = useOpsStore((state) => state.addPromotions);

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setUploadSuccessCount(null);

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('엑셀 파일(.xlsx, .xls) 또는 .csv 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const newPromos = parseExcelCalendar(buffer);

      if (newPromos.length === 0) {
        setErrorMsg('엑셀 파일에서 유효한 프로모션 행을 찾을 수 없습니다.');
        return;
      }

      addPromotions(newPromos);
      setUploadSuccessCount(newPromos.length);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('엑셀 파일을 읽는 중 오류가 발생했습니다. 양식을 확인해주세요.');
    }
  };

  const handleDownloadSample = () => {
    const buffer = createSampleCalendarTemplate();
    const blob = new Blob([buffer as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2026_인동FN_연간_프로모션_캘린더_양식.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">연간 캘린더 업로드 & D-Day 자동 스케줄링</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            연간 행사 계획 엑셀 파일(.xlsx)을 업로드하면 시스템이 각 행사의 마일스톤(D-7, D-5, D-2, D-1)을 자동 계산하여 캘린더에 일괄 등록합니다.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          샘플 엑셀 양식 받기
        </button>
      </div>

      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFileProcess(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileProcess(file);
          }}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 mb-3 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            연간 행사 계획 엑셀 파일을 이곳에 끌어다 놓거나 클릭하여 선택하세요
          </p>
          <p className="text-xs text-slate-400 mt-1">
            지원 파일: .xlsx, .csv (행사명, 브랜드, 시작일, 종료일, 할인율 자동 인식)
          </p>
        </div>
      </div>

      {/* 상태 알림 */}
      {uploadSuccessCount !== null && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            성공적으로 <strong>{uploadSuccessCount}개</strong>의 프로모션 일정을 파싱하여 캘린더 및 마일스톤(D-7 ~ D-1)에 등록했습니다!
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
