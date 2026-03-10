
import React, { useState, useEffect, useRef } from 'react';
// Mock Chart Library (for visual representation, not actual charting)
const Chart = ({ type, data, options }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (chartRef.current) {
      // Simulate chart rendering
      chartRef.current.innerHTML = `<div style="background-color: var(--color-slate-100); border-radius: var(--radius-md); height: 100%; display: flex; align-items: center; justify-content: center; color: var(--color-charcoal-500); font-size: var(--font-size-sm);">
        ${type.toUpperCase()} Chart: ${options?.title || 'Data Visualization'}
      </div>`;
    }
  }, [type, data, options]);
  return <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>;
};

// Mock Icons
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconFilter = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>;
const IconArrowUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
const IconArrowDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;
const IconCheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.81"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const STATUS_COLORS = {
  'Approved': 'status-approved',
  'In Progress': 'status-in-progress',
  'Pending': 'status-pending',
  'Rejected': 'status-rejected',
  'Exception': 'status-exception',
};

// RBAC Configuration
const ROLES = {
  policyholder: {
    dashboardAccess: ['overview', 'myClaims'],
    canSubmitClaim: true,
    canViewAllClaims: false,
    canEditClaim: false,
    canApproveReject: false,
    auditLogsVisibility: ['self'],
  },
  claimsOfficer: {
    dashboardAccess: ['overview', 'allClaims', 'pendingApprovals'],
    canSubmitClaim: false,
    canViewAllClaims: true,
    canEditClaim: true,
    canApproveReject: true,
    auditLogsVisibility: ['all'],
  },
  claimsManager: {
    dashboardAccess: ['overview', 'allClaims', 'pendingApprovals', 'slaBreaches'],
    canSubmitClaim: false,
    canViewAllClaims: true,
    canEditClaim: true,
    canApproveReject: true,
    auditLogsVisibility: ['all'],
    canExportReports: true,
  },
  verificationTeam: {
    dashboardAccess: ['overview', 'claimsForVerification'],
    canSubmitClaim: false,
    canViewAllClaims: true, // Limited view for claims needing verification
    canEditClaim: true, // Can update verification status/details
    canApproveReject: false,
    auditLogsVisibility: ['relevant'],
  },
  financeTeam: {
    dashboardAccess: ['overview', 'claimsForPayout'],
    canSubmitClaim: false,
    canViewAllClaims: true, // Limited view for claims needing payout
    canEditClaim: true, // Can update payment status
    canApproveReject: false,
    auditLogsVisibility: ['relevant'],
  },
};

const App = () => {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [userRole, setUserRole] = useState('claimsOfficer'); // Default role for demonstration
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: '',
    claimType: '',
    dateRange: { start: '', end: '' },
    assignedTo: '',
  });

  // --- New state for editing claims ---
  const [isEditingClaim, setIsEditingClaim] = useState(false);
  const [editedClaim, setEditedClaim] = useState(null); // The claim object currently being edited

  // --- Sample Data Generation ---
  const generateSampleData = () => {
    const claims = [];
    const claimTypes = ['Auto', 'Home', 'Health', 'Life', 'Property'];
    const statuses = ['Approved', 'In Progress', 'Pending', 'Rejected', 'Exception'];
    const officers = ['Alice Smith', 'Bob Johnson', 'Charlie Brown'];
    const policyholders = ['Emma White', 'David Green'];
    const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    for (let i = 1; i <= 20; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const submissionDate = randomDate(new Date(2023, 0, 1), new Date());
      const lastUpdateDate = randomDate(submissionDate, new Date());
      const claimId = `CLAIM-${1000 + i}`;
      const policyholder = policyholders[Math.floor(Math.random() * policyholders.length)];
      const assignedOfficer = officers[Math.floor(Math.random() * officers.length)];
      const claimType = claimTypes[Math.floor(Math.random() * claimTypes.length)];
      const amount = (Math.random() * 10000 + 500).toFixed(2);
      const description = `Claim for ${claimType} insurance filed by ${policyholder} due to an incident on ${submissionDate.toLocaleDateString()}.`;

      const workflowStages = [
        { name: 'Submitted', completed: true, date: submissionDate },
        { name: 'Review', completed: false, date: null },
        { name: 'Verification', completed: false, date: null },
        { name: 'Approval', completed: false, date: null },
        { name: 'Payout', completed: false, date: null },
      ];

      let statusIndex = statuses.indexOf(status);
      if (status === 'Approved') statusIndex = 4; // Payout completed
      if (status === 'Rejected') statusIndex = 3; // Approval step, then rejected
      if (status === 'Exception') statusIndex = Math.floor(Math.random() * 4); // Random stage

      for (let j = 0; j <= statusIndex; j++) {
        workflowStages[j].completed = true;
        workflowStages[j].date = new Date(submissionDate.getTime() + j * 86400000 * 2); // 2 days per stage
      }
      if (status === 'In Progress') {
        const lastCompleted = workflowStages.findLastIndex(s => s.completed);
        if (lastCompleted < workflowStages.length - 1) {
          workflowStages[lastCompleted + 1].completed = false; // Mark current as in progress (visually)
        }
      }

      const auditLog = [
        { id: 1, timestamp: new Date(submissionDate.getTime() - 3600000).toISOString(), user: policyholder, action: `Claim ${claimId} initiated.` },
        { id: 2, timestamp: submissionDate.toISOString(), user: policyholder, action: `Claim ${claimId} submitted with documents.` },
        { id: 3, timestamp: new Date(submissionDate.getTime() + 86400000).toISOString(), user: assignedOfficer, action: `Claim ${claimId} moved to 'Review' stage.` },
      ];
      if (statusIndex >= 2) {
        auditLog.push({ id: 4, timestamp: new Date(submissionDate.getTime() + 2 * 86400000).toISOString(), user: 'Verification Team', action: `Documents for claim ${claimId} verified.` });
      }
      if (statusIndex >= 3) {
        auditLog.push({ id: 5, timestamp: new Date(submissionDate.getTime() + 3 * 86400000).toISOString(), user: assignedOfficer, action: `Claim ${claimId} recommendation for ${status}.` });
      }
      if (status === 'Approved') {
        auditLog.push({ id: 6, timestamp: new Date(submissionDate.getTime() + 4 * 86400000).toISOString(), user: 'Claims Manager', action: `Claim ${claimId} officially approved.` });
        auditLog.push({ id: 7, timestamp: new Date(submissionDate.getTime() + 5 * 86400000).toISOString(), user: 'Finance Team', action: `Payout for claim ${claimId} processed.` });
      } else if (status === 'Rejected') {
        auditLog.push({ id: 6, timestamp: new Date(submissionDate.getTime() + 4 * 86400000).toISOString(), user: 'Claims Manager', action: `Claim ${claimId} rejected due to insufficient documentation.` });
      } else if (status === 'Exception') {
        auditLog.push({ id: 6, timestamp: new Date(submissionDate.getTime() + 4 * 86400000).toISOString(), user: 'Claims Manager', action: `Claim ${claimId} flagged for exception handling. Requires manual review.` });
      }

      claims.push({
        id: claimId,
        policyholder: policyholder,
        claimType: claimType,
        amount: parseFloat(amount),
        status: status,
        submissionDate: submissionDate.toISOString(),
        lastUpdate: lastUpdateDate.toISOString(),
        assignedOfficer: assignedOfficer,
        description: description,
        documents: [{ name: 'Policy Document.pdf', type: 'PDF' }, { name: 'Accident Report.jpg', type: 'JPG' }],
        relatedClaims: i > 1 ? [`CLAIM-${1000 + i - 1}`] : [],
        workflow: workflowStages,
        auditLog: auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), // Newest first
        slaBreach: Math.random() > 0.8, // 20% chance of SLA breach
      });
    }
    return claims;
  };

  const [claimsData, setClaimsData] = useState(() => generateSampleData());
  const [kpiData, setKpiData] = useState(() => ({
    totalClaims: claimsData.length,
    pendingClaims: claimsData.filter(c => c.status === 'Pending').length,
    approvedClaims: claimsData.filter(c => c.status === 'Approved').length,
    slaBreaches: claimsData.filter(c => c.slaBreach).length,
  }));

  // Simulate real-time updates for KPIs
  useEffect(() => {
    const interval = setInterval(() => {
      setClaimsData(prevClaims => {
        const updatedClaims = prevClaims.map(claim => {
          if (Math.random() < 0.1) { // 10% chance to update a claim's status
            const statuses = ['Approved', 'In Progress', 'Pending', 'Rejected', 'Exception'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return { ...claim, status: newStatus, lastUpdate: new Date().toISOString() };
          }
          return claim;
        });
        return updatedClaims;
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update KPI data whenever claimsData changes
    setKpiData({
      totalClaims: claimsData.length,
      pendingClaims: claimsData.filter(c => c.status === 'Pending').length,
      approvedClaims: claimsData.filter(c => c.status === 'Approved').length,
      slaBreaches: claimsData.filter(c => c.slaBreach).length,
    });
  }, [claimsData]);

  // --- Utility Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => STATUS_COLORS[status] || '';

  // --- Handlers ---
  const handleCardClick = (claimId) => {
    setView({ screen: 'CLAIM_DETAIL', params: { claimId } });
    setIsEditingClaim(false); // Reset edit mode when navigating to a new claim
    setEditedClaim(null);
  };

  const handleBackToDashboard = () => {
    setView({ screen: 'DASHBOARD', params: {} });
    setIsEditingClaim(false); // Reset edit mode when leaving detail view
    setEditedClaim(null);
  };

  const handleOpenSearch = () => setIsSearchOpen(true);
  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (item) => {
    console.log('Search item selected:', item);
    // In a real app, navigate to the selected item's detail page
    if (item.type === 'claim') {
      handleCardClick(item.id);
    }
    handleCloseSearch();
  };

  const handleOpenFilters = () => setIsFiltersOpen(true);
  const handleCloseFilters = () => setIsFiltersOpen(false);
  const handleFilterChange = (field, value) => {
    setActiveFilters(prev => ({ ...prev, [field]: value }));
  };
  const handleDateFilterChange = (field, value) => {
    setActiveFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, [field]: value } }));
  };
  const handleApplyFilters = () => {
    console.log('Applying filters:', activeFilters);
    setIsFiltersOpen(false);
    // In a real app, this would trigger data re-fetching or client-side filtering
  };
  const handleClearFilters = () => {
    setActiveFilters({ status: '', claimType: '', dateRange: { start: '', end: '' }, assignedTo: '' });
    console.log('Filters cleared.');
    // Optional: Keep filters panel open or close
  };

  // --- New Handlers for Edit Claim functionality ---
  const handleEditClaimStart = (claimToEdit) => {
    setIsEditingClaim(true);
    setEditedClaim({ ...claimToEdit }); // Create a mutable copy for editing
  };

  const handleEditClaimChange = (e) => {
    const { name, value } = e.target;
    setEditedClaim(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSaveClaimChanges = () => {
    setClaimsData(prevClaims =>
      prevClaims.map(c => (c.id === editedClaim?.id ? { ...editedClaim, lastUpdate: new Date().toISOString() } : c))
    );
    setIsEditingClaim(false);
    setEditedClaim(null);
  };

  const handleCancelEdit = () => {
    setIsEditingClaim(false);
    setEditedClaim(null);
  };
  // --- End New Handlers ---

  // RBAC check function
  const canPerformAction = (action) => {
    return ROLES[userRole]?.[action] === true;
  };

  // Filtered Claims for Dashboard (client-side simulation)
  const filteredClaims = claimsData.filter(claim => {
    const matchesSearch = searchTerm ?
      (claim.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyholder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.status?.toLowerCase().includes(searchTerm.toLowerCase())) : true;

    const matchesStatus = activeFilters.status ? claim.status === activeFilters.status : true;
    const matchesClaimType = activeFilters.claimType ? claim.claimType === activeFilters.claimType : true;
    const matchesAssignedTo = activeFilters.assignedTo ? claim.assignedOfficer === activeFilters.assignedTo : true;

    const claimDate = new Date(claim.submissionDate);
    const matchesStartDate = activeFilters.dateRange.start ? claimDate >= new Date(activeFilters.dateRange.start) : true;
    const matchesEndDate = activeFilters.dateRange.end ? claimDate <= new Date(activeFilters.dateRange.end) : true;

    return matchesSearch && matchesStatus && matchesClaimType && matchesAssignedTo && matchesStartDate && matchesEndDate;
  });

  // Unique options for filter/edit selects
  const uniqueClaimTypes = [...new Set(claimsData.map(c => c.claimType))];
  const uniqueOfficers = [...new Set(claimsData.map(c => c.assignedOfficer))];

  // --- Components ---
  const Header = () => (
    <header className="header">
      <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => setView({ screen: 'DASHBOARD', params: {} })}>
        ClaimsPro
      </div>
      <nav className="header-nav">
        <a href="#" className="nav-item active" onClick={() => setView({ screen: 'DASHBOARD', params: {} })}>Dashboard</a>
        <a href="#" className="nav-item">Claims</a>
        <a href="#" className="nav-item">Reports</a>
      </nav>
      <div className="header-actions flex items-center gap-md">
        <button className="icon-button" onClick={handleOpenSearch}>
          <IconSearch />
        </button>
        <button className="icon-button" onClick={handleOpenFilters}>
          <IconFilter />
        </button>
        <div style={{ marginLeft: 'var(--spacing-md)' }}>
          <button className="icon-button">
            <IconUser />
          </button>
          <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', marginLeft: 'var(--spacing-sm)', color: 'var(--color-charcoal-700)' }}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>
      </div>
    </header>
  );

  const GlobalSearchOverlay = () => {
    const searchSuggestions = searchTerm.length > 2
      ? claimsData
          .filter(c =>
            c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.policyholder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.claimType?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 5) // Limit suggestions
          .map(c => ({ id: c.id, label: `${c.id} - ${c.claimType} by ${c.policyholder}`, type: 'claim' }))
      : [];

    return (
      <div className={`global-search-overlay ${isSearchOpen ? 'open' : ''}`}>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search claims, policies, documents..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => { if (e.key === 'Escape') handleCloseSearch(); }}
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={handleCloseSearch}
              className="icon-button"
              style={{ position: 'absolute', right: 'var(--spacing-sm)', top: '50%', transform: 'translateY(-50%)' }}
            >
              <IconX />
            </button>
          )}
          {searchSuggestions.length > 0 && (
            <div className="search-suggestions">
              {searchSuggestions.map(item => (
                <div key={item.id} className="search-suggestion-item" onClick={() => handleSearchSubmit(item)}>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleCloseSearch}
          className="icon-button"
          style={{ position: 'absolute', top: 'var(--spacing-lg)', right: 'var(--spacing-lg)' }}
        >
          <IconX />
        </button>
      </div>
    );
  };

  const FiltersPanel = () => {
    return (
      <div className={`filters-panel ${isFiltersOpen ? 'open' : ''}`}>
        <div className="filters-header">
          <h3>Filters</h3>
          <button className="icon-button" onClick={handleCloseFilters}>
            <IconX />
          </button>
        </div>

        <div className="filter-group">
          <label htmlFor="filterStatus">Status</label>
          <select
            id="filterStatus"
            value={activeFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filterClaimType">Claim Type</label>
          <select
            id="filterClaimType"
            value={activeFilters.claimType}
            onChange={(e) => handleFilterChange('claimType', e.target.value)}
          >
            <option value="">All Types</option>
            {uniqueClaimTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filterAssignedTo">Assigned To</label>
          <select
            id="filterAssignedTo"
            value={activeFilters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
          >
            <option value="">All Officers</option>
            {uniqueOfficers.map(officer => (
              <option key={officer} value={officer}>{officer}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filterStartDate">Submission Date Range</label>
          <input
            type="date"
            id="filterStartDate"
            value={activeFilters.dateRange.start}
            onChange={(e) => handleDateFilterChange('start', e.target.value)}
            style={{ marginBottom: 'var(--spacing-sm)' }}
          />
          <input
            type="date"
            id="filterEndDate"
            value={activeFilters.dateRange.end}
            onChange={(e) => handleDateFilterChange('end', e.target.value)}
          />
        </div>

        <div className="filters-actions">
          <button className="btn-clear" onClick={handleClearFilters}>Clear All</button>
          <button className="btn-apply" onClick={handleApplyFilters}>Apply Filters</button>
        </div>
      </div>
    );
  };

  const KPICard = ({ title, value, trend, trendType, color, pulse }) => (
    <div className="card kpi-card clickable-card" style={{ borderLeft: `5px solid ${color}` }}>
      <div className="kpi-card-content">
        <div className="kpi-label" style={{ color: color }}>{title}</div>
        <div className={`kpi-value ${pulse ? 'pulse-animation' : ''}`}>{value}</div>
        {trend && (
          <div className={`kpi-trend ${trendType === 'positive' ? 'positive' : 'negative'}`}>
            {trendType === 'positive' ? <IconArrowUp /> : <IconArrowDown />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );

  const ClaimCard = ({ claim }) => {
    const cardStatusClass = getStatusClass(claim?.status);
    return (
      <div
        className="card claim-card clickable-card"
        onClick={() => handleCardClick(claim?.id)}
        style={{ borderColor: `var(--${cardStatusClass.split('-')[0]}-${cardStatusClass.split('-')[1]}-border)` }}
      >
        <div className="claim-card-header">
          <h4 className="claim-card-title">{claim?.id} - {claim?.claimType}</h4>
          <span className={`claim-card-status-pill ${cardStatusClass}`}>
            {claim?.status}
          </span>
        </div>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-charcoal-700)', marginBottom: 'var(--spacing-sm)' }}>
          Policyholder: <strong>{claim?.policyholder}</strong>
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-charcoal-700)', marginBottom: 'var(--spacing-sm)' }}>
          Amount: <strong>${claim?.amount?.toLocaleString()}</strong>
        </p>
        <div className="claim-card-meta">
          Submitted: {formatDate(claim?.submissionDate)} | Last Update: {formatDate(claim?.lastUpdate)}
        </div>
        {claim?.slaBreach && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--status-rejected-border)', fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--spacing-sm)' }}>
            🚨 SLA Breach!
          </div>
        )}
      </div>
    );
  };

  const MilestoneTracker = ({ workflow }) => {
    const currentStageIndex = workflow?.findIndex(s => !s.completed) -1; // First incomplete, so previous is active
    const activeIndex = currentStageIndex === -1 ? (workflow?.length - 1 || -1) : currentStageIndex; // Ensure valid index

    return (
      <div className="card milestone-tracker">
        <h3>Workflow Progress</h3>
        <div className="milestone-steps">
          {workflow?.map((step, index) => (
            <div key={step.name} className="milestone-step">
              <div
                className={`milestone-circle ${step.completed ? 'completed' : ''} ${index === activeIndex ? 'active' : ''}`}
                style={{
                  backgroundColor: step.completed
                    ? 'var(--status-approved-border)'
                    : (index === activeIndex ? 'var(--status-in-progress-border)' : 'var(--color-charcoal-300)'),
                  borderColor: 'var(--color-white)',
                }}
              >
                {step.completed && <IconCheckCircle style={{ color: 'var(--color-white)' }} />}
              </div>
              <span className="milestone-label">{step.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AuditFeed = ({ logs }) => (
    <div className="card audit-feed-card">
      <h3>News & Audit Feed</h3>
      <ul className="audit-feed-list">
        {logs?.map(log => (
          <li key={log.id} className="audit-feed-item">
            <p>{log.action}</p>
            <span>{log.user} on {formatDate(log.timestamp)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const DashboardScreen = () => (
    <div className="dashboard-screen">
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Overview Dashboard</h1>

      <div className="dashboard-grid kpi">
        <KPICard title="Total Claims" value={kpiData?.totalClaims} trend="+5% (30d)" trendType="positive" color="#007bff" pulse={true} />
        <KPICard title="Pending Claims" value={kpiData?.pendingClaims} trend="-2% (24h)" trendType="negative" color="#ffc107" pulse={true} />
        <KPICard title="Approved Claims" value={kpiData?.approvedClaims} trend="+12% (30d)" trendType="positive" color="#28a745" pulse={true} />
        <KPICard title="SLA Breaches" value={kpiData?.slaBreaches} trend="+1 (24h)" trendType="negative" color="#dc3545" pulse={true} />
      </div>

      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Recent Claims ({filteredClaims.length} results)</h2>
      <div className="dashboard-grid claim-list" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {filteredClaims.length > 0 ? (
          filteredClaims.map(claim => <ClaimCard key={claim.id} claim={claim} />)
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-xxl)' }}>
            <h3 style={{ color: 'var(--color-charcoal-500)' }}>No claims found matching your criteria.</h3>
            <p>Try adjusting your search or filters.</p>
            <button
              onClick={handleOpenFilters}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-sm)',
                marginTop: 'var(--spacing-md)'
              }}
            >
              Adjust Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ClaimDetailScreen = ({
    claimId,
    isEditingClaim,
    editedClaim,
    handleEditClaimStart,
    handleEditClaimChange,
    handleSaveClaimChanges,
    handleCancelEdit,
    uniqueClaimTypes,
    uniqueOfficers,
  }) => {
    const claim = claimsData.find(c => c.id === claimId);

    if (!claim) {
      return (
        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <h1>Claim not found.</h1>
          <button onClick={handleBackToDashboard} style={{ color: 'var(--color-primary)' }}>Back to Dashboard</button>
        </div>
      );
    }

    return (
      <div className="claim-detail-screen">
        <div className="breadcrumbs">
          <a href="#" onClick={handleBackToDashboard}>Dashboard</a>
          <span>/</span>
          <span>Claim Details</span>
          <span>/</span>
          <strong>{claim?.id}</strong>
        </div>

        <div className="detail-header">
          <h1 className="detail-title">{claim?.id} - {claim?.claimType}</h1>
          <div className="action-buttons">
            {canPerformAction('canEditClaim') && !isEditingClaim && (
              <button onClick={() => handleEditClaimStart(claim)}>Edit Claim</button>
            )}
            {isEditingClaim && (
              <>
                <button className="btn-save" onClick={handleSaveClaimChanges}>Save Changes</button>
                <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
              </>
            )}
            {canPerformAction('canApproveReject') && claim?.status === 'Pending' && !isEditingClaim && (
              <>
                <button style={{ backgroundColor: 'var(--status-approved-border)' }}>Approve</button>
                <button style={{ backgroundColor: 'var(--status-rejected-border)' }}>Reject</button>
              </>
            )}
            {canPerformAction('canExportReports') && !isEditingClaim && (
              <button>Export to PDF</button>
            )}
          </div>
        </div>

        <MilestoneTracker workflow={claim?.workflow} />

        <div className="detail-sections">
          <div className="detail-main-col">
            <div className="card">
              <h2>Claim Summary</h2>
              <p><strong>Policyholder:</strong> {claim?.policyholder}</p>
              <p>
                <strong>Claim Type:</strong>{' '}
                {isEditingClaim ? (
                  <select
                    name="claimType"
                    value={editedClaim?.claimType || ''}
                    onChange={handleEditClaimChange}
                    className="edit-input"
                  >
                    {uniqueClaimTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  claim?.claimType
                )}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {isEditingClaim ? (
                  <select
                    name="status"
                    value={editedClaim?.status || ''}
                    onChange={handleEditClaimChange}
                    className="edit-input"
                  >
                    {Object.keys(STATUS_COLORS).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`claim-card-status-pill ${getStatusClass(claim?.status)}`}>{claim?.status}</span>
                )}
              </p>
              <p>
                <strong>Amount:</strong>{' '}
                {isEditingClaim ? (
                  <input
                    type="number"
                    name="amount"
                    value={editedClaim?.amount || ''}
                    onChange={handleEditClaimChange}
                    className="edit-input"
                  />
                ) : (
                  `$${claim?.amount?.toLocaleString()}`
                )}
              </p>
              <p><strong>Submission Date:</strong> {formatDate(claim?.submissionDate)}</p>
              <p><strong>Last Update:</strong> {formatDate(claim?.lastUpdate)}</p>
              <p>
                <strong>Assigned Officer:</strong>{' '}
                {isEditingClaim ? (
                  <select
                    name="assignedOfficer"
                    value={editedClaim?.assignedOfficer || ''}
                    onChange={handleEditClaimChange}
                    className="edit-input"
                  >
                    {uniqueOfficers.map(officer => (
                      <option key={officer} value={officer}>{officer}</option>
                    ))}
                  </select>
                ) : (
                  claim?.assignedOfficer
                )}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                {isEditingClaim ? (
                  <textarea
                    name="description"
                    value={editedClaim?.description || ''}
                    onChange={handleEditClaimChange}
                    className="edit-input"
                    rows="3"
                  ></textarea>
                ) : (
                  claim?.description
                )}
              </p>
              {claim?.slaBreach && (
                <p style={{ color: 'var(--status-rejected-border)', fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--spacing-md)' }}>
                  🚨 This claim is in SLA breach. Immediate action required!
                </p>
              )}
            </div>

            <div className="card">
              <h2>Supporting Documents</h2>
              {claim?.documents?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {claim.documents.map((doc, index) => (
                    <li key={index} style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px dashed var(--color-slate-100)' }}>
                      <a href="#" style={{ display: 'flex', alignItems: 'center', color: 'var(--color-charcoal-700)' }}>
                        <span style={{ marginRight: 'var(--spacing-sm)' }}>📄</span> {doc.name} (.{doc.type})
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No documents uploaded for this claim.</p>
              )}
            </div>

            <div className="card">
              <h2>Related Records</h2>
              {claim?.relatedClaims?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {claim.relatedClaims.map((relatedId, index) => (
                    <li key={index} style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px dashed var(--color-slate-100)' }}>
                      <a href="#" onClick={() => handleCardClick(relatedId)} style={{ color: 'var(--color-primary)' }}>
                        {relatedId} - {claimsData.find(c => c.id === relatedId)?.claimType || 'Unknown Type'}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No related claims found.</p>
              )}
            </div>

            <div className="card">
              <h2>Analytics & Performance</h2>
              <div className="chart-container" style={{ height: '300px' }}>
                <Chart type="bar" data={{}} options={{ title: 'Claim Processing Time (Days)' }} />
              </div>
              <div className="chart-container" style={{ height: '300px', marginTop: 'var(--spacing-lg)' }}>
                <Chart type="line" data={{}} options={{ title: 'Payout Trend' }} />
              </div>
            </div>

          </div>

          {(ROLES[userRole]?.auditLogsVisibility === 'all' || (ROLES[userRole]?.auditLogsVisibility === 'relevant' && ['claimsManager', 'claimsOfficer'].includes(userRole))) && (
            <AuditFeed logs={claim?.auditLog} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {view.screen === 'DASHBOARD' && <DashboardScreen />}
        {view.screen === 'CLAIM_DETAIL' && (
          <ClaimDetailScreen
            claimId={view.params.claimId}
            isEditingClaim={isEditingClaim}
            editedClaim={editedClaim}
            handleEditClaimStart={handleEditClaimStart}
            handleEditClaimChange={handleEditClaimChange}
            handleSaveClaimChanges={handleSaveClaimChanges}
            handleCancelEdit={handleCancelEdit}
            uniqueClaimTypes={uniqueClaimTypes}
            uniqueOfficers={uniqueOfficers}
          />
        )}
      </main>

      <GlobalSearchOverlay />
      <FiltersPanel />
    </div>
  );
};

export default App;