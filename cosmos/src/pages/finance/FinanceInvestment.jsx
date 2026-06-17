import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../widgets/DashboardLayout';
import Modal from '../../shared/ui/Modal';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import useConfirm from '../../shared/lib/useConfirm';
import { useInvestment } from '../../features/partner-ledger/hooks/useInvestment';
import InvestmentForm from '../../features/partner-ledger/components/InvestmentForm';
import InvestmentTable from '../../features/partner-ledger/components/InvestmentTable';
import '../../shared/ui/DataPage.css';
import '../../shared/ui/DonutChart.css';
import './FinanceInvestment.css';
import { ExternalLink } from 'lucide-react';

// Interactive Donut Chart from FinanceOverview
function InvestmentPieChart({ data, totalInvestment }) {
  const [hoveredSegment, setHoveredSegment] = React.useState(null);
  const [donutTooltipPos, setDonutTooltipPos] = React.useState({ x: 0, y: 0 });

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const innerR = 55;
  const strokeW = r - innerR;
  const circumference = 2 * Math.PI * r;

  const formatCenterAmount = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  const donutSegments = React.useMemo(() => {
    const total = totalInvestment || 1;
    let cumulative = 0;
    return data.map((item, i) => {
      const fraction = item.count / total;
      const dashArray = `${fraction * circumference} ${circumference}`;
      const rotation = cumulative * 360 - 90;
      cumulative += fraction;
      return { ...item, index: i, dashArray, rotation };
    });
  }, [data, totalInvestment, circumference]);

  const handleDonutInteraction = (seg, e) => {
    setHoveredSegment(seg);
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDonutTooltipPos({
      x: clientX - rect.left + 15,
      y: clientY - rect.top + 15
    });
  };

  if (totalInvestment === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available</div>;
  }

  return (
    <div className="donut-container" style={{ minHeight: 180 }}>
      <div className="donut-wrapper" style={{ flexDirection: 'column', gap: 16, width: '100%' }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={`donut-svg${hoveredSegment ? ' has-hover' : ''}`}
          >
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={strokeW} />
            {donutSegments.map((seg, i) => {
              const isHovered = hoveredSegment && hoveredSegment.index === seg.index;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeW + 4 : strokeW}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={0}
                  transform={`rotate(${seg.rotation} ${cx} ${cy})`}
                  strokeLinecap="butt"
                  className={`donut-segment${isHovered ? ' active' : ''}`}
                  style={{
                    transition: 'stroke-width 0.2s, filter 0.2s, opacity 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => handleDonutInteraction(seg, e)}
                  onMouseMove={(e) => handleDonutInteraction(seg, e)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onTouchStart={(e) => handleDonutInteraction(seg, e)}
                  onTouchMove={(e) => handleDonutInteraction(seg, e)}
                  onTouchEnd={() => setHoveredSegment(null)}
                />
              );
            })}
            <g className="donut-center-text">
              <text x={cx} y={cy - 4} textAnchor="middle" className="donut-center-val" style={{ fontSize: 20 }}>
                {hoveredSegment ? formatCenterAmount(hoveredSegment.count) : formatCenterAmount(totalInvestment)}
              </text>
              <text x={cx} y={cy + 16} textAnchor="middle" className="donut-center-lbl">
                {hoveredSegment ? hoveredSegment.type : 'Total Investment'}
              </text>
            </g>
          </svg>

          {hoveredSegment && (
            <div className="donut-tooltip" style={{ left: `${donutTooltipPos.x}px`, top: `${donutTooltipPos.y}px` }}>
              <div className="donut-tooltip-header">
                <span className="donut-tooltip-dot" style={{ background: hoveredSegment.color }} />
                <span className="donut-tooltip-type">{hoveredSegment.type}</span>
              </div>
              <div className="donut-tooltip-body">
                <span className="donut-tooltip-count">₹{hoveredSegment.count.toLocaleString('en-IN')}</span>
                <span className="donut-tooltip-pct">{hoveredSegment.percent}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="donut-legend" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px 16px', width: '100%', marginTop: 8 }}>
          {donutSegments.map((seg, i) => (
            <div
              key={i}
              className={`donut-legend-item${hoveredSegment && hoveredSegment.index === seg.index ? ' active' : ''}`}
              onMouseEnter={() => setHoveredSegment(seg)}
              onMouseLeave={() => setHoveredSegment(null)}
              style={{ padding: '2px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', minWidth: 0, flex: 1 }}>
                <span className="donut-dot" style={{ background: seg.color, width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
                <span className="donut-label" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{seg.type}</span>
              </div>
              <span className="donut-percent" style={{ fontSize: 11.5, flexShrink: 0 }}>{seg.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FinanceInvestment() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { investments, addInvestment, updateInvestment, removeInvestment } = useAppState();

  const investmentState = useInvestment({
    investments,
    addInvestment,
    updateInvestment,
    removeInvestment,
    addToast,
    confirm
  });

  const {
    isFormOpen,
    setIsFormOpen,
    partnerName,
    setPartnerName,
    investmentAmount,
    setInvestmentAmount,
    duration,
    setDuration,
    mobileNumber,
    setMobileNumber,
    aadhaarNumber,
    setAadhaarNumber,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    panNumber,
    setPanNumber,
    nomineeName,
    setNomineeName,
    remarks,
    setRemarks,
    nomineeAadhaar,
    setNomineeAadhaar,
    nomineePan,
    setNomineePan,
    address,
    setAddress,
    googleDriveLink,
    setGoogleDriveLink,
    editId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalInvestmentAmount,
    activePartnersCount,
    paginatedRecords,
    totalPages,
    PAGE_SIZE,
    isViewMode,
    handleResetForm,
    handleCancel,
    handleSaveInvestment,
    handleEditRecord,
    handleViewRecord,
    handleDeleteRecord,
    handleHardDeleteRecord,
    handleExportCSV
  } = investmentState;

  useEffect(() => {
    document.title = 'Investment Management | Cosmos';
  }, []);

  const lastMonthStats = React.useMemo(() => {
    const today = new Date('2026-06-06');
    const prevMonthTo = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().slice(0, 10);

    const active = investments || [];
    const currentTotal = active.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const prevTotal = active.filter(inv => {
      const d = inv.start_date || inv.startDate || '2026-06-06';
      return d <= prevMonthTo;
    }).reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

    return { currentTotal, prevTotal };
  }, [investments]);

  const investmentPct = React.useMemo(() => {
    if (lastMonthStats.prevTotal === 0) return 0;
    return ((lastMonthStats.currentTotal - lastMonthStats.prevTotal) / lastMonthStats.prevTotal) * 100;
  }, [lastMonthStats]);

  const renderKpiTag = (pct) => {
    if (pct === 0) {
      return <span className="kpi-tag muted" style={{ background: '#f1f5f9', color: '#64748b' }}>0% vs last month</span>;
    }
    if (pct > 0) {
      return <span className="kpi-tag trend-up">↗ +{pct.toFixed(1)}% vs last month</span>;
    }
    return <span className="kpi-tag trend-down">↘ {pct.toFixed(1)}% vs last month</span>;
  };

  const colors = ['#c0392b', '#1e293b', '#e74c3c', '#cbd5e1', '#3498db', '#a0c4ff', '#8e44ad', '#2c3e50', '#27ae60'];
  const partnerData = Object.entries(
    investments.reduce((acc, inv) => {
      acc[inv.partner] = (acc[inv.partner] || 0) + Number(inv.amount || 0);
      return acc;
    }, {})
  )
    .map(([name, value], index) => {
      const percent = Math.round((value / (totalInvestmentAmount || 1)) * 100);
      return {
        type: name,
        count: value,
        percent,
        color: colors[index % colors.length]
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <DashboardLayout>
      <div className="finance-investment-page">
        {/* Toggle shortcut row */}
        <div className="finance-investment-actions-row">
          <button
            type="button"
            className="data-btn data-btn-primary"
            onClick={() => {
              if (isFormOpen && editId) {
                investmentState.setEditId(null);
                handleResetForm();
              } else {
                setIsFormOpen(!isFormOpen);
              }
            }}
          >
            {isFormOpen ? '✕ Close Form' : '+ New Investment'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
          {/* KPI metrics area */}
          <div>
            <div className="kpi-row" style={{ marginBottom: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
              <div className="kpi-card" style={{ margin: 0 }}>
                <div className="kpi-header">
                  <div className="kpi-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  {renderKpiTag(investmentPct)}
                </div>
                <div className="kpi-body">
                  <div className="kpi-title">TOTAL INVESTMENTS</div>
                  <div className="kpi-value">₹{totalInvestmentAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="kpi-card" style={{ margin: 0 }}>
                <div className="kpi-header">
                  <div className="kpi-icon-wrap" style={{ color: '#16a34a' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="kpi-tag trend-up">↗ +4 new this week</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-title">ACTIVE PARTNERS</div>
                  <div className="kpi-value">{activePartnersCount}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Pie Chart Card */}
          <div className="panel-card" style={{ width: '100%', margin: 0 }}>
            <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div className="panel-title-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h3 className="panel-title" style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Investment Distribution</h3>
                <p className="panel-subtitle" style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>Primary funding segment weights</p>
              </div>
              <button className="panel-more-btn" title="More Options" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </div>
            <InvestmentPieChart data={partnerData} totalInvestment={totalInvestmentAmount} />
          </div>
        </div>

        {/* Collapsible Entry Form */}
        {isFormOpen && (
          <InvestmentForm
            isViewMode={isViewMode}
            partnerName={partnerName}
            setPartnerName={setPartnerName}
            investmentAmount={investmentAmount}
            setInvestmentAmount={setInvestmentAmount}
            duration={duration}
            setDuration={setDuration}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            aadhaarNumber={aadhaarNumber}
            setAadhaarNumber={setAadhaarNumber}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            panNumber={panNumber}
            setPanNumber={setPanNumber}
            nomineeName={nomineeName}
            setNomineeName={setNomineeName}
            remarks={remarks}
            setRemarks={setRemarks}
            nomineeAadhaar={nomineeAadhaar}
            setNomineeAadhaar={setNomineeAadhaar}
            nomineePan={nomineePan}
            setNomineePan={setNomineePan}
            address={address}
            setAddress={setAddress}
            googleDriveLink={googleDriveLink}
            setGoogleDriveLink={setGoogleDriveLink}
            editId={editId}
            handleCancel={handleCancel}
            handleResetForm={handleResetForm}
            handleSaveInvestment={handleSaveInvestment}
          />
        )}

        {/* Investment Records Table Card */}
        <InvestmentTable
          paginatedRecords={paginatedRecords}
          filteredRecordsCount={investmentState.filteredRecords.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          PAGE_SIZE={PAGE_SIZE}
          handleExportCSV={handleExportCSV}
          handleEditRecord={handleEditRecord}
          handleDeleteRecord={handleDeleteRecord}
          handleActivateRecord={investmentState.handleActivateRecord}
          handleHardDeleteRecord={handleHardDeleteRecord}
          setViewRecord={handleViewRecord}
        />
      </div>
    </DashboardLayout>
  );
}
