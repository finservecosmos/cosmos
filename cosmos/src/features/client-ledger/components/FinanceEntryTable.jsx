import React, { useState, useEffect } from 'react';
import { Download, FileText, Edit, Trash2, DollarSign } from 'lucide-react';

export default function FinanceEntryTable({
  paginatedRecords,
  filteredRecordsCount,
  searchQuery,
  setSearchQuery,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  currentPage,
  setCurrentPage,
  totalPages,
  PAGE_SIZE,
  handleExportCSV,
  handleEditRecord,
  handleDeleteRecord,
  handleViewRecord,
  setRepaymentRecord
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0, renderUpwards: false });

  // Auto-close three-dot popovers when clicking elsewhere or pressing Escape
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveMenuId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="new-client-form-card" style={{ padding: '20px 24px' }}>
      <div className="client-records-header-row">
        <div className="records-title-wrap">
          <h2 className="records-title">Client Records</h2>
          <span className="records-badge">{filteredRecordsCount} TOTAL</span>
        </div>

        <div className="records-filter-toolbar" style={{ alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>From Date</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{
                  border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px',
                  fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-surface)', outline: 'none', width: '100%'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>To Date</label>
              <input 
                type="date" 
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{
                  border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px',
                  fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-surface)', outline: 'none', width: '100%'
                }}
              />
            </div>
          </div>

          <div className="records-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by name, phone, or ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            type="button" 
            className="data-btn data-btn-outline" 
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', gap: 6 }}
          >
            <Download size={16} style={{ verticalAlign: "middle" }} /> Export Excel
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 16, paddingBottom: 140 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Mobile Number</th>
              <th>Principal Amount</th>
              <th>Interest</th>
              <th>Total Payable</th>
              <th>Due Date</th>
              <th>Days Remaining</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px var(--border)' }}>
                  No active finance records found.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec, index) => {
                const isLastRow = index === paginatedRecords.length - 1;
                return (
                  <tr key={rec.id}>
                  <td style={{ fontWeight: 700 }}>{rec.name}</td>
                  <td className="cell-muted" style={{ fontFamily: 'monospace' }}>{rec.phone}</td>
                  <td className="cell-amount">₹{rec.principal.toLocaleString('en-IN')}</td>
                  <td className="cell-amount" style={{ color: 'var(--text-secondary)' }}>₹{rec.interest.toLocaleString('en-IN')}</td>
                  <td className="cell-amount" style={{ fontWeight: 800 }}>₹{rec.total.toLocaleString('en-IN')}</td>
                  <td className="cell-muted">{rec.dueDate}</td>
                  <td>
                    <span className={`due-badge ${rec.dueClass}`}>
                      {rec.daysRemaining}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${rec.status.toLowerCase()}`}>
                      {rec.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions" style={{ justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                      <button 
                        type="button"
                        className="finance-table-action-link primary" 
                        onClick={() => setRepaymentRecord(rec)} 
                        title="Record Repayment"
                      >
                        Repay
                      </button>
                      <button 
                        type="button"
                        className="finance-table-action-link secondary" 
                        onClick={() => handleViewRecord(rec)} 
                        title="View Details"
                      >
                        View
                      </button>

                      <div className="action-menu-container" style={{ zIndex: activeMenuId === rec.id ? 999 : 1, position: 'relative' }}>
                        <button
                          type="button"
                          className="three-dot-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === rec.id ? null : rec.id);
                            
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const renderUpwards = spaceBelow < 120;
                            
                            setMenuPos({ 
                              x: rect.right - 160, 
                              y: renderUpwards ? rect.top - 85 : rect.bottom + 5,
                              renderUpwards 
                            });
                          }}
                          aria-label="More Actions"
                        >
                          &#8942;
                        </button>
                        {activeMenuId === rec.id && (
                          <div 
                            className="action-popover" 
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'fixed',
                              top: menuPos.renderUpwards ? 'auto' : menuPos.y,
                              bottom: menuPos.renderUpwards ? window.innerHeight - menuPos.y - 85 : 'auto',
                              left: menuPos.x,
                              margin: 0,
                              zIndex: 9999
                            }}
                          >
                            <button 
                              type="button"
                              className="popover-item" 
                              onClick={() => { handleEditRecord(rec); setActiveMenuId(null); }}
                            >
                              <Edit size={14} /> Edit details
                            </button>
                            <button 
                              type="button"
                              className="popover-item danger" 
                              onClick={() => { handleDeleteRecord(rec); setActiveMenuId(null); }}
                            >
                              <Trash2 size={14} /> Delete record
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );})
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {filteredRecordsCount > PAGE_SIZE && (
        <div className="data-pagination" style={{ borderTop: 'none', padding: '16px 0 0' }}>
          <span className="data-pagination-info">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(filteredRecordsCount, currentPage * PAGE_SIZE)} of {filteredRecordsCount} entries
          </span>
          <div className="data-pagination-btns">
            <button className="data-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`data-page-btn${currentPage === i + 1 ? ' active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="data-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}
