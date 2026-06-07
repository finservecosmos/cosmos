import React, { useState, useEffect } from 'react';

export default function ClientRecordsTable({
  paginatedClients,
  search,
  setSearch,
  loanFilter,
  setLoan,
  statusFilter,
  setStatus,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredCount,
  LOAN_TYPES,
  STATUSES,
  formatAmount,
  statusClass,
  openViewModal,
  openEditModal
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Auto-close three-dot popovers when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  return (
    <>
      {/* Toolbar */}
      <div className="data-toolbar">
        <div className="data-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            placeholder="Search by name, file no, phone..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="data-filter-select" value={loanFilter} onChange={e => setLoan(e.target.value)}>
          {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="data-filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="data-btn data-btn-outline">Export</button>
      </div>

      {/* Table */}
      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>File No.</th>
              <th>Loan Type</th>
              <th>Amount</th>
              <th>Associate</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="data-empty">
                    <div className="data-empty-icon">🔍</div>
                    <div className="data-empty-title">No clients found</div>
                    <div className="data-empty-sub">Try adjusting your search or filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedClients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-name">
                      <div className="cell-avatar">{c.name ? c.name.charAt(0) : '?'}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="cell-muted" style={{ fontSize: 11 }}>{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-muted">{c.file_no}</td>
                  <td>{c.loan_type}</td>
                  <td className="cell-amount">{formatAmount(c.amount)}</td>
                  <td className="cell-muted">{c.associate}</td>
                  <td className="cell-muted">{c.date}</td>
                  <td><span className={statusClass(c.status)}>{c.status}</span></td>
                  <td>
                    <div className="action-menu-container">
                      <button
                        type="button"
                        className="three-dot-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === c.id ? null : c.id);
                        }}
                        aria-label="Actions"
                      >
                        ⋮
                      </button>
                      {activeMenuId === c.id && (
                        <div className="action-popover" onClick={(e) => e.stopPropagation()}>
                          <button className="popover-item" onClick={() => { openViewModal(c); setActiveMenuId(null); }}>
                            👁️ View details
                          </button>
                          <button className="popover-item" onClick={() => { openEditModal(c); setActiveMenuId(null); }}>
                            ✏️ Edit record
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filteredCount > 0 && (
          <div className="data-pagination">
            <span className="data-pagination-info">
              Showing {Math.min(filteredCount, (currentPage - 1) * 5 + 1)} to {Math.min(filteredCount, currentPage * 5)} of {filteredCount} clients
            </span>
            <div className="data-pagination-btns">
              <button className="data-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} className={`data-page-btn${currentPage === i + 1 ? ' active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="data-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
