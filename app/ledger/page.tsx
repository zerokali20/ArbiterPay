'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useTheme } from '@/components/ThemeProvider';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function LedgerPage() {
  const { theme } = useTheme();
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetch('/api/ledger')
      .then((res) => res.json())
      .then((data) => {
        setRowData(data.ledger || []);
        if (data.ledger && data.ledger.length > 0) {
          setSelectedEvent(data.ledger[0]);
        }
      })
      .catch((err) => console.error('Failed to load ledger:', err))
      .finally(() => setLoading(false));
  }, []);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: 'Timestamp',
        sortable: true,
        filter: true,
        width: 180,
        cellClass: 'font-mono text-xs text-slate-600 dark:text-[#81848b]',
        valueFormatter: (params) => {
          if (!params.value) return '';
          return new Date(params.value).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) + ' (' + new Date(params.value).toLocaleDateString() + ')';
        },
      },
      {
        field: 'eventType',
        headerName: 'Event Type',
        sortable: true,
        filter: true,
        flex: 1,
        cellRenderer: (params: any) => {
          const type = params.value || '';
          let color = 'text-slate-800 dark:text-[#ececed]';
          if (type.includes('PAYOUT_RELEASED')) color = 'text-emerald-600 dark:text-[#4cb782]';
          else if (type.includes('CAPTURED')) color = 'text-blue-600 dark:text-[#3b82f6]';
          else if (type.includes('FAILED')) color = 'text-rose-600 dark:text-[#e5484d]';
          else if (type.includes('ROUTED')) color = 'text-amber-600 dark:text-[#d9a441]';

          return (
            <span className={`font-mono text-xs font-semibold ${color}`}>
              {type}
            </span>
          );
        },
      },
      {
        field: 'actorType',
        headerName: 'Actor',
        sortable: true,
        filter: true,
        width: 100,
        cellClass: 'font-mono text-xs text-slate-600 dark:text-[#81848b] uppercase',
      },
      {
        field: 'jobId',
        headerName: 'Job ID',
        filter: true,
        width: 120,
        cellClass: 'font-mono text-xs text-slate-600 dark:text-[#81848b]',
        valueFormatter: (p) => p.value || '—',
      },
      {
        field: 'milestoneId',
        headerName: 'Milestone',
        filter: true,
        width: 110,
        cellClass: 'font-mono text-xs text-slate-600 dark:text-[#81848b]',
        valueFormatter: (p) => p.value || '—',
      },
    ],
    []
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
            Audit Ledger
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#ececed] mt-1">
            Immutable AG Grid Audit Trail
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#81848b] font-mono mt-0.5">
            Cryptographic append-only log recording every AI verdict, confidence rating, and PayPal transaction
          </p>
        </div>

        <div className="flex gap-2 text-xs font-mono">
          <Link
            href="/jobs/sample-demo-job"
            className="px-3 py-1.5 rounded bg-slate-100 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] text-slate-800 dark:text-[#ececed] hover:bg-slate-200 dark:hover:bg-[#1a1b1e] transition-colors"
          >
            ← Milestone Demo
          </Link>
          <Link
            href="/review"
            className="px-3 py-1.5 rounded bg-slate-100 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] text-slate-800 dark:text-[#ececed] hover:bg-slate-200 dark:hover:bg-[#1a1b1e] transition-colors"
          >
            Human Review Screen
          </Link>
        </div>
      </div>

      {/* Grid + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AG Grid */}
        <div className="lg:col-span-2 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] p-3 flex flex-col h-[550px] overflow-hidden transition-colors">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-[#81848b] pb-2 border-b border-slate-200 dark:border-[#212225] mb-2">
            <span>AUDITED SYSTEM EVENTS ({rowData.length})</span>
            <span className="text-[10px] text-emerald-600 dark:text-[#4cb782]">AG GRID COMMUNITY</span>
          </div>

          <div className={`flex-1 w-full ${theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}`}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              onRowClicked={(event) => setSelectedEvent(event.data)}
              rowSelection={{ mode: 'singleRow' }}
            />
          </div>
        </div>

        {/* JSON Inspector */}
        <div className="rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] p-5 flex flex-col justify-between h-[550px] overflow-y-auto font-mono text-xs transition-colors">
          <div>
            <div className="border-b border-slate-200 dark:border-[#212225] pb-3 mb-4 flex justify-between items-center text-slate-500 dark:text-[#81848b]">
              <span className="text-[11px] uppercase tracking-wider font-bold">Event Details</span>
              <span className="text-[10px]">{selectedEvent?.id || 'Select Row'}</span>
            </div>

            {selectedEvent ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-[#81848b] uppercase block">Type</span>
                  <p className="text-slate-900 dark:text-[#ececed] font-bold mt-0.5">{selectedEvent.eventType}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 dark:text-[#81848b] uppercase block">Actor</span>
                  <p className="text-slate-600 dark:text-[#81848b] uppercase mt-0.5">{selectedEvent.actorType}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 dark:text-[#81848b] uppercase block">Payload / Evidence</span>
                  <pre className="mt-1.5 p-3 rounded bg-slate-50 dark:bg-[#08090a] border border-slate-200 dark:border-[#212225] text-emerald-700 dark:text-[#4cb782] text-[11px] overflow-x-auto max-h-[260px]">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 dark:text-[#81848b] text-center py-20">
                Click any row in the AG Grid to view payload.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-[#212225] text-[10px] text-slate-500 dark:text-[#81848b] flex justify-between">
            <span>Status</span>
            <span className="text-emerald-600 dark:text-[#4cb782]">IMMUTABLE_LOGGED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
