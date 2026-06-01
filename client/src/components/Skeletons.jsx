// src/components/Skeletons.jsx
import React from 'react';

// 1. For Row-based lists (Projects, Publications, Vacancies)
export const RowSkeleton = () => (
  <div className="bg-white border-l-4 border-l-slate-200 border border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-sm animate-pulse w-full">
    <div className="flex-1 space-y-3 w-full">
      <div className="h-5 bg-slate-200 rounded w-3/4 sm:w-1/2"></div>
      <div className="flex gap-4 pt-1">
        <div className="h-3 bg-slate-200 rounded w-16"></div>
        <div className="h-3 bg-slate-200 rounded w-24"></div>
        <div className="h-3 bg-slate-200 rounded w-20"></div>
      </div>
    </div>
    <div className="h-6 bg-slate-100 border border-slate-200 rounded w-20 mt-4 sm:mt-0"></div>
  </div>
);

// 2. For Grid-based layout blocks (Scholars, Achievements)
export const CardSkeleton = () => (
  <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm animate-pulse space-y-4 w-full">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 bg-slate-200 rounded-full flex-shrink-0"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-3 bg-slate-200 rounded w-full"></div>
      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
    </div>
  </div>
);

// 3. For Table-based structures (Completed Projects, Financial Records, Logs)
export const TableSkeletonRow = () => (
  <>
    {[1, 2, 3, 4, 5].map((num) => (
      <tr key={num} className="animate-pulse bg-white">
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-5/6 mb-1"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-7 bg-slate-200 rounded w-20"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-5 bg-slate-200 rounded w-16"></div>
        </td>
      </tr>
    ))}
  </>
);