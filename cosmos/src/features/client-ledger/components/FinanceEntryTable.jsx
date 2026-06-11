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

  return (
    <div className="new-client-form-card" style={{ padding: '20px 24px' }}>
      <div className="client-records-header-row">
        <div className="records-title-wrap">
          <h2 className="records-title">Client Records</h2>
          <span className="records-badge">{filteredRecordsCount} TOTAL</span>
        </div>

        <div className="records-filter-toolbar">
          <div className="date-range-picker">
            <input 
              type="date" 
              className="date-range-input" 
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              title="From Date"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>to</span>
            <input 
              type="date" 
              className="date-range-input" 
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              title="To Date"
            />
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
            style={{ display: 'inline-flex', alignSelf: 'center', gap: 6 }}
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
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="row-btn" onClick={() => handleViewRecord(rec)} title="View Details">
                        <FileText size={15} />
                      </button>
                      <button className="row-btn" onClick={() => setRepaymentRecord(rec)} title="Record Repayment">
                        <DollarSign size={15} />
                      </button>
                      <button className="row-btn" onClick={() => handleEditRecord(rec)} title="Edit Details">
                        <Edit size={15} />
                      </button>
                      <button className="row-btn danger" onClick={() => handleDeleteRecord(rec)} title="Delete Record">
                        <Trash2 size={15} />
                      </button>
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
