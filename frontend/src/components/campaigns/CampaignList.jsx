import React from "react";
import "../dashboard/Dashboard.css";

const mockCampaigns = [
  { name: "Summer Sale", status: "Active", audience: 756, sent: 750, opened: 432, clicked: 198 },
  { name: "New Product Launch", status: "Scheduled", audience: 512, sent: 510, opened: 345, clicked: 156 },
  { name: "Win-back Campaign", status: "Completed", audience: 324, sent: 320, opened: 187, clicked: 89 },
];

export default function CampaignList() {
  return (
    <div className="dashboard-root">
      <div className="dashboard-title" style={{marginBottom: 24}}>All Campaigns</div>
      <div className="dashboard-maincard">
        <div className="dashboard-maincard-content" style={{padding: 0}}>
          <div className="dashboard-table-header" style={{ display: 'grid', gridTemplateColumns: '22% 15% 15% 15% 16% 17%' }}>
            <div className="dashboard-table-cell-header">Campaign</div>
            <div className="dashboard-table-cell-header">Status</div>
            <div className="dashboard-table-cell-header">Audience</div>
            <div className="dashboard-table-cell-header">Sent</div>
            <div className="dashboard-table-cell-header">Open Rate</div>
            <div className="dashboard-table-cell-header">Click Rate</div>
          </div>
          <div>
            {mockCampaigns.map((c, idx) => (
              <div key={idx} className="dashboard-table-row" style={{ display: 'grid', gridTemplateColumns: '22% 15% 15% 15% 16% 17%' }}>
                <div className="dashboard-table-cell"><span style={{ fontWeight: 600, color: '#1E293B' }}>{c.name}</span></div>
                <div className="dashboard-table-cell">
                  <span className={`segment-tag ${
                    c.status === 'Active' ? 'segment-tag-green' :
                    c.status === 'Scheduled' ? 'segment-tag-blue' :
                    'segment-tag-gray'}`}>{c.status}</span>
                </div>
                <div className="dashboard-table-cell"><span style={{ fontWeight: 500 }}>{c.audience.toLocaleString()}</span></div>
                <div className="dashboard-table-cell"><span style={{ fontWeight: 500 }}>{c.sent.toLocaleString()}</span></div>
                <div className="dashboard-table-cell"><span style={{ fontWeight: 500 }}>{Math.round((c.opened / c.sent) * 100)}%</span></div>
                <div className="dashboard-table-cell"><span style={{ fontWeight: 500 }}>{Math.round((c.clicked / c.sent) * 100)}%</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}