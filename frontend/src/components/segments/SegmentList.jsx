import React from "react";
import "../dashboard/Dashboard.css";
import { PeopleAlt as PeopleIcon, Visibility as VisibilityIcon } from "@mui/icons-material";

const mockSegments = [
  { name: "High-Value Customers", subscribers: 320, clickRate: 28, conversionRate: 12 },
  { name: "Recent Purchasers", subscribers: 580, clickRate: 24, conversionRate: 8 },
  { name: "Newsletter Subscribers", subscribers: 1240, clickRate: 18, conversionRate: 5 },
];

export default function SegmentList() {
  return (
    <div className="dashboard-root">
      <div className="dashboard-title" style={{marginBottom: 24}}>All Segments</div>
      <div className="dashboard-maincard">
        <div className="dashboard-maincard-content" style={{padding: '0 8px'}}>
          {mockSegments.map((segment, idx) => (
            <div key={idx} style={{ padding: '0 8px' }}>
              <div style={{ padding: "16px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#1E293B", marginBottom: 4 }}>{segment.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <PeopleIcon fontSize="small" style={{ color: '#64748B', fontSize: '0.875rem' }} />
                      <span style={{ color: "#64748B", fontSize: "1rem" }}>{segment.subscribers.toLocaleString()} Subscribers</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <VisibilityIcon fontSize="small" style={{ color: '#64748B', fontSize: '0.875rem' }} />
                      <span style={{ color: "#64748B", fontSize: "1rem" }}>{segment.clickRate}% CTR</span>
                    </div>
                  </div>
                </div>
                <span 
                  style={{ 
                    height: 24, 
                    background: segment.conversionRate > 10 ? '#10AB6D' : '#3E63DD', 
                    color: 'white', 
                    fontWeight: 600, 
                    fontSize: '0.75rem', 
                    borderRadius: 8, 
                    padding: '4px 12px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  {segment.conversionRate}% CVR
                </span>
              </div>
              {idx < mockSegments.length - 1 && <hr style={{border: 'none', borderTop: '1px solid #E2E8F0'}} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}