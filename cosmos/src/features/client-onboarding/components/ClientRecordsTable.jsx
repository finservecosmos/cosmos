import React, { useState, useEffect } from 'react';
import { Eye, Edit, Printer, Trash2 } from 'lucide-react';
import cosmosLogo from '../../../assets/cosmosLogo.jpeg';

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
  openEditModal,
  handleDeleteClient
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Auto-close three-dot popovers when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handlePrint = (client) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Client Details - ${client.name}</title>
          <style>
            body { font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; padding: 20px; color: #111827; line-height: 1.4; max-width: 800px; margin: 0 auto; }
            .top-bar { display: flex; justify-content: space-between; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            .header { display: flex; align-items: center; justify-content: center; gap: 16px; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
            .header-text { display: flex; flex-direction: column; align-items: flex-start; }
            .header h1 { margin: 0; color: #1e3a8a; font-size: 24px; letter-spacing: -0.5px; }
            .header p { margin: 4px 0 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
            .section { margin-bottom: 16px; page-break-inside: avoid; }
            .section-title { font-size: 15px; font-weight: 700; color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
            .field { display: flex; flex-direction: column; gap: 2px; }
            .label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-size: 15px; font-weight: 500; color: #111827; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
            .full-width { grid-column: 1 / -1; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px dashed #d1d5db; text-align: center; font-size: 12px; color: #9ca3af; }
            @media print {
              @page { margin: 0; }
              body { padding: 0 !important; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <table style="width: 100%; border-collapse: collapse; border: none;">
            <thead><tr><td style="height: 20mm; border: none; padding: 0;"></td></tr></thead>
            <tbody><tr><td style="border: none; padding: 0 40px;">
          <div class="header">
            <img src="${cosmosLogo}" alt="Cosmos Logo" style="width: 50px; height: 50px; border-radius: 8px; object-fit: contain;" />
            <div class="header-text">
              <h1>Cosmos Financial Services</h1>
              <p>Client Record Details</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="grid">
              <div class="field"><div class="label">Client Name</div><div class="value">${client.name || '—'}</div></div>
              <div class="field"><div class="label">Co-Applicant Name</div><div class="value">${client.extended_data?.co_applicate_name || '—'}</div></div>
              <div class="field"><div class="label">Phone Number</div><div class="value">${client.phone || '—'}</div></div>
              <div class="field"><div class="label">Residential Status</div><div class="value">${client.residential_status || '—'}</div></div>
              <div class="field"><div class="label">Location</div><div class="value">${client.location || '—'}</div></div>
              <div class="field"><div class="label">PAN Number</div><div class="value">${client.pan_card || '—'}</div></div>
              <div class="field"><div class="label">Aadhaar Number</div><div class="value">${client.aadhaar_number || '—'}</div></div>
              <div class="field full-width"><div class="label">Google Drive Link</div><div class="value">${client.drive_link || '—'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Lending Parameters</div>
            <div class="grid">
              <div class="field"><div class="label">Application Date</div><div class="value">${client.date || '—'}</div></div>
              <div class="field"><div class="label">Loan Type</div><div class="value">${client.loan_type || '—'}</div></div>
              <div class="field"><div class="label">Amount</div><div class="value">₹${client.amount ? Number(client.amount).toLocaleString('en-IN') : '—'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Employment & Income Profile</div>
            <div class="grid">
              <div class="field"><div class="label">Employment Status</div><div class="value">${client.employment_status || '—'}</div></div>
              <div class="field"><div class="label">Monthly Net Income</div><div class="value">₹${client.monthly_net_income ? Number(client.monthly_net_income).toLocaleString('en-IN') : '—'}</div></div>
              <div class="field"><div class="label">Co-Applicant Income</div><div class="value">₹${client.co_applicant_income ? Number(client.co_applicant_income).toLocaleString('en-IN') : '—'}</div></div>
              <div class="field"><div class="label">Dwelling Status</div><div class="value">${client.dwelling_status || '—'}</div></div>
              <div class="field"><div class="label">Tenure at Address</div><div class="value">${client.tenure_at_address ? client.tenure_at_address + ' Years' : '—'}</div></div>
              <div class="field"><div class="label">Company Name</div><div class="value">${client.extended_data?.company_name || '—'}</div></div>
              <div class="field"><div class="label">Job Title</div><div class="value">${client.extended_data?.job_title || '—'}</div></div>
              <div class="field"><div class="label">Years in Company</div><div class="value">${client.extended_data?.years_in_company || '—'}</div></div>
              <div class="field"><div class="label">Salary Type</div><div class="value">${client.extended_data?.salary_type || '—'}</div></div>
              <div class="field"><div class="label">ESI & PF</div><div class="value">${client.extended_data?.esi_pf || '—'}</div></div>
              <div class="field"><div class="label">URN</div><div class="value">${client.extended_data?.urn || '—'}</div></div>
              <div class="field"><div class="label">Manager Name</div><div class="value">${client.extended_data?.manager_name || '—'}</div></div>
              <div class="field"><div class="label">Manager Mobile</div><div class="value">${client.extended_data?.manager_mobile || '—'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Property & Banking</div>
            <div class="grid">
              <div class="field"><div class="label">Property Value</div><div class="value">₹${client.extended_data?.property_value ? Number(client.extended_data.property_value).toLocaleString('en-IN') : '—'}</div></div>
              <div class="field"><div class="label">Name of Banker</div><div class="value">${client.extended_data?.banker_name || '—'}</div></div>
              <div class="field"><div class="label">Bank Manager Name</div><div class="value">${client.extended_data?.bank_manager_name || '—'}</div></div>
              <div class="field"><div class="label">Bank Manager Number</div><div class="value">${client.extended_data?.bank_manager_number || '—'}</div></div>
              <div class="field"><div class="label">CIBIL Score (Applicant)</div><div class="value">${client.extended_data?.cibil_applicant || '—'}</div></div>
              <div class="field"><div class="label">CIBIL Score (Co-Applicant)</div><div class="value">${client.extended_data?.cibil_co_applicant || '—'}</div></div>
              <div class="field"><div class="label">Applicant Total Loans</div><div class="value">${client.extended_data?.applicant_total_loans || '—'}</div></div>
              <div class="field"><div class="label">Co-Applicant Total Loans</div><div class="value">${client.extended_data?.co_applicant_total_loans || '—'}</div></div>
              <div class="field full-width"><div class="label">Applicant CIBIL Briefing</div><div class="value">${client.extended_data?.applicant_cibil_briefing || '—'}</div></div>
              <div class="field full-width"><div class="label">Co-Applicant CIBIL Briefing</div><div class="value">${client.extended_data?.co_applicant_cibil_briefing || '—'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Issues & Final Details</div>
            <div class="grid">
              <div class="field"><div class="label">Document Related Issues</div><div class="value">${client.extended_data?.document_issues || '—'}</div></div>
              <div class="field"><div class="label">Business Related Issues</div><div class="value">${client.extended_data?.business_issues || '—'}</div></div>
              <div class="field"><div class="label">Family Related Issues</div><div class="value">${client.extended_data?.family_issues || '—'}</div></div>
              <div class="field full-width"><div class="label">Notes</div><div class="value">${client.extended_data?.convert_notes || '—'}</div></div>
            </div>
          </div>

          <div class="footer">
            Printed on ${new Date().toLocaleString()} &bull; Cosmos Financial Services Internal Record
          </div>
            </td></tr></tbody>
            <tfoot><tr><td style="height: 20mm; border: none; padding: 0;"></td></tr></tfoot>
          </table>

          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setActiveMenuId(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="data-toolbar">
        <div className="data-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            placeholder="Search by name, phone..." 
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
                <td colSpan={7}>
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
                      <div className="cell-avatar">{typeof c.name === 'string' && c.name ? c.name.charAt(0).toUpperCase() : '?'}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name || 'Unknown'}</div>
                        <div className="cell-muted" style={{ fontSize: 11 }}>{c.phone || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.loan_type}</td>
                  <td className="cell-amount">{formatAmount(c.amount)}</td>
                  <td className="cell-muted">{c.associate}</td>
                  <td className="cell-muted">{c.date}</td>
                  <td><span className={statusClass(c.status)}>{c.status}</span></td>
                  <td>
                    <div className="action-menu-container" style={{ zIndex: activeMenuId === c.id ? 999 : 1, position: 'relative' }}>
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
                          <button className="popover-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { openViewModal(c); setActiveMenuId(null); }}>
                            <Eye size={16} /> View details
                          </button>
                          <button className="popover-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { openEditModal(c); setActiveMenuId(null); }}>
                            <Edit size={16} /> Edit record
                          </button>
                          <button className="popover-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handlePrint(c)}>
                            <Printer size={16} /> Print details
                          </button>
                          <button className="popover-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }} onClick={() => { handleDeleteClient(c); setActiveMenuId(null); }}>
                            <Trash2 size={16} /> Delete record
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
