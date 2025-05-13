import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, CircularProgress, Alert, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { campaignService } from "../../services/api";
import "../dashboard/Dashboard.css";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch campaigns from the backend
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await campaignService.getCampaigns();
        console.log("Campaigns from API:", response);
        
        // Check if we have campaigns in the response
        if (response && response.campaigns) {
          setCampaigns(response.campaigns);
        } else {
          console.warn("No campaigns found in response:", response);
          setCampaigns([]);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to load campaigns. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCreateCampaign = () => {
    navigate("/campaigns/new");
  };

  // Helper function to calculate open and click rates
  const calculateRate = (numerator, denominator) => {
    if (!denominator || denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100);
  };

  if (loading) {
    return (
      <div className="dashboard-root">
        <div className="dashboard-title" style={{ marginBottom: 24 }}>All Campaigns</div>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-root">
        <div className="dashboard-title" style={{ marginBottom: 24 }}>All Campaigns</div>
        <Box sx={{ mb: 3 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="dashboard-title">All Campaigns</div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCampaign}
        >
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 2, mb: 3 }}>
          <Alert severity="info" sx={{ justifyContent: 'center', mb: 2 }}>
            No campaigns found
          </Alert>
          <p>Create your first campaign to start reaching your customers</p>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCampaign}
            sx={{ mt: 2 }}
          >
            Create Campaign
          </Button>
        </Box>
      ) : (
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
              {campaigns.map((c, idx) => (
                <div 
                  key={c._id || idx} 
                  className="dashboard-table-row" 
                  style={{ display: 'grid', gridTemplateColumns: '22% 15% 15% 15% 16% 17%', cursor: 'pointer' }}
                  onClick={() => navigate(`/campaigns/${c._id}`)}
                >
                  <div className="dashboard-table-cell"><span style={{ fontWeight: 600, color: '#1E293B' }}>{c.name}</span></div>
                  <div className="dashboard-table-cell">
                    <span className={`segment-tag ${
                      c.status === 'Active' ? 'segment-tag-green' :
                      c.status === 'Scheduled' || c.status === 'Draft' ? 'segment-tag-blue' :
                      c.status === 'Completed' ? 'segment-tag-purple' :
                      c.status === 'Paused' ? 'segment-tag-yellow' :
                      c.status === 'Cancelled' ? 'segment-tag-red' :
                      'segment-tag-gray'}`}>{c.status}</span>
                  </div>
                  <div className="dashboard-table-cell"><span style={{ fontWeight: 500 }}>{(c.audienceSize || 0).toLocaleString()}</span></div>
                  <div className="dashboard-table-cell"><span style={{ fontWeight: 500 }}>{(c.sent || 0).toLocaleString()}</span></div>
                  <div className="dashboard-table-cell">
                    <span style={{ fontWeight: 500 }}>
                      {calculateRate(c.opened || 0, c.sent || 0)}%
                    </span>
                  </div>
                  <div className="dashboard-table-cell">
                    <span style={{ fontWeight: 500 }}>
                      {calculateRate(c.clicked || 0, c.sent || 0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}