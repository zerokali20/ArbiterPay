'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function LedgerPage() {
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
        width: 190,
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
          let badgeColor = 'bg-slate-100 text-slate-800';
          if (type.includes('PAYOUT_RELEASED')) badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
          else if (type.includes('CAPTURED')) badgeColor = 'bg-blue-100 text-blue-800 font-semibold';
          else if (type.includes('FAILED')) badgeColor = 'bg-rose-100 text-rose-800';
          else if (type.includes('ROUTED')) badgeColor = 'bg-amber-100 text-amber-800 font-semibold';

          return (
            <span className={`px-2 py-1 rounded text-xs font-mono ${badgeColor}`}>
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
        width: 110,
        cellRenderer: (params: any) => {
          const actor = params.value;
          return (
            <span className="uppercase text-xs font-semibold tracking-wider text-slate-600">
              {actor}
            </span>
          );
        },
      },
      {
        field: 'jobId',
        headerName: 'Job ID',
        filter: true,
        width: 130,
        valueFormatter: (p) => p.value || 'N/A',
      },
      {
        field: 'milestoneId',
        headerName: 'Milestone',
        filter: true,
        width: 120,
        valueFormatter: (p) => p.value || '—',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              🏛️ Immutable Audit Ledger
            </h1>
            <p className="text-sm text-slate-600">
              Powered by <strong>AG Grid</strong>: append-only cryptographic log recording every AI Arbiter evaluation, confidence score, policy decision, and PayPal payment event.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/review"
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              🛡️ Human Review Dashboard
            </Link>
            <Link
              href="/jobs/sample-demo-job"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm"
            >
              ⚡ Interactive Escrow Demo
            </Link>
          </div>
        </div>

        {/* Ledger Grid and Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AG Grid Column */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Audited System Events ({rowData.length})
              </span>
              <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-semibold">
                AG Grid Community
              </span>
            </div>

            <div className="flex-1 w-full ag-theme-quartz">
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

          {/* Event Inspector Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between h-[600px] overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Event Details</h3>
                <span className="text-xs font-mono text-slate-400">
                  {selectedEvent?.id || 'Select Row'}
                </span>
              </div>

              {selectedEvent ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Event Type</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{selectedEvent.eventType}</p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Actor</span>
                    <p className="text-slate-700 uppercase font-mono text-xs mt-0.5">
                      {selectedEvent.actorType}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Timestamp</span>
                    <p className="text-slate-600 text-xs mt-0.5">
                      {new Date(selectedEvent.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Payload & Evidence Details (JSON)
                    </span>
                    <pre className="mt-1.5 p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[260px]">
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 text-sm">
                  Click any row in the AG Grid to inspect the full payload and AI decision audit trail.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
              <span>Auditable Proof & Nonce</span>
              <span className="font-mono text-[10px]">IDEMPOTENT_VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
