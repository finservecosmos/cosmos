import React, { useState, useEffect } from 'react';

export default function InvestmentTable({
  paginatedRecords,
  filteredRecordsCount,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  PAGE_SIZE,
  handleExportCSV,
  handleEditRecord,
  handleDeleteRecord,
  setViewRecord
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Auto-close three-dot actions menu on click elsewhere
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const triggerActionMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="investment-form-card" style={{ padding: '20px 24px' }}>
      <div className="client-records-header-row" style={{ marginBottom: 16 }}>
        <div className="records-title-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18, color: 'var(--accent)' }}>
            <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
          </svg>
          <h2 className="records-title">Partner Investment Records</h2>
        </div>

        <div className="records-filter-toolbar">
          <select
            className="data-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="records-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search partner..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="data-btn data-btn-outline"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignSelf: 'center', gap: 6 }}
          >
            📥 Export Excel
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 80 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Partner Name</th>
              <th>Investment Amount</th>
              <th>Int Amount</th>
              <th>Duration</th>
              <th>End Date</th>
              <th>Remaining</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px var(--border)' }}>
                  No partner investment records found.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec) => (
                <tr key={rec.id}>
                  <td style={{ fontWeight: 700 }}>{rec.partner}</td>
                  <td className="cell-amount">₹{rec.amount.toLocaleString('en-IN')}</td>
                  <td className="cell-amount" style={{ color: 'var(--text-secondary)' }}>₹{rec.interest.toLocaleString('en-IN')}</td>
                  <td className="cell-muted">{rec.duration}</td>
                  <td className="cell-muted">{rec.displayEndDate}</td>
                  <td>
                    <div className="remaining-days-bar-container">
                      <span className="remaining-days-text">{rec.remainingDays} Days</span>
                      <div className="remaining-days-bar-bg">
                        <div
                          className={`remaining-days-bar-fill ${rec.barColor}`}
                          style={{ width: `${Math.min(100, (rec.remainingDays / 540) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${rec.status.toLowerCase()}`}>
                      {rec.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="panel-more-btn"
                        title="View Details"
                        onClick={() => setViewRecord(rec)}
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        className="panel-more-btn"
                        title="Edit Record"
                        onClick={() => handleEditRecord(rec)}
                      >
                        ✏️
                      </button>
                      <div className="action-menu-container">
                        <button
                          type="button"
                          className="panel-more-btn"
                          title="More Actions"
                          onClick={(e) => triggerActionMenu(e, rec.id)}
                        >
                          ⋮
                        </button>

                        {activeMenuId === rec.id && (
                          <div className="action-popover" onClick={(e) => e.stopPropagation()}>
                            <button className="popover-item danger" onClick={() => { handleDeleteRecord(rec); setActiveMenuId(null); }}>
                              🗑️ Deactivate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRecordsCount > PAGE_SIZE && (
        <div className="data-pagination" style={{ borderTop: 'none', padding: '16px 0 0' }}>
          <span className="data-pagination-info">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(filteredRecordsCount, currentPage * PAGE_SIZE)} of {filteredRecordsCount} active records
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
