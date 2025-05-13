import { useState, useEffect } from "react";
import { 
  CircularProgress, 
  Button, 
  Box, 
  Chip, 
  Typography, 
  Divider,
  Card,
  CardContent
} from "@mui/material";
import { 
  PeopleAlt as PeopleIcon, 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { segmentService } from "../../services/api";
import "../dashboard/Dashboard.css";

export default function SegmentList() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await segmentService.getSegments();
        setSegments(data.segments || []);
      } catch (err) {
        console.error("Error fetching segments:", err);
        setError("Failed to load segments. Please try again later.");
        
        // Fallback to mock data for demo purposes
        setSegments([
          { 
            _id: "seg1", 
            name: "High-Value Customers", 
            description: "Customers who have spent more than ₹1000",
            audienceSize: 320, 
            rules: [{ field: "totalSpend", operator: "greaterThan", value: 1000 }],
            isActive: true 
          },
          { 
            _id: "seg2", 
            name: "Recent Purchasers", 
            description: "Customers who made a purchase in the last 30 days",
            audienceSize: 580, 
            rules: [{ field: "lastPurchaseDate", operator: "greaterThan", value: "30-days-ago" }],
            isActive: true 
          },
          { 
            _id: "seg3", 
            name: "Newsletter Subscribers", 
            description: "Customers who subscribed to the newsletter",
            audienceSize: 1240, 
            rules: [{ field: "tags", operator: "contains", value: "newsletter" }],
            isActive: true 
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  const handleCreateSegment = () => {
    navigate('/segments');
  };

  const handleEditSegment = (segmentId) => {
    navigate(`/segments?id=${segmentId}`);
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!window.confirm("Are you sure you want to delete this segment?")) return;
    
    try {
      await segmentService.deleteSegment(segmentId);
      setSegments(segments.filter(segment => segment._id !== segmentId));
    } catch (err) {
      console.error("Error deleting segment:", err);
      alert("Failed to delete segment. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <div className="dashboard-error">{error}</div>
        <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  return (
    <div className="dashboard-root">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div className="dashboard-title">Customer Segments</div>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateSegment}
        >
          Create Segment
        </Button>
      </Box>
      
      {segments.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>No segments found</Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Create your first customer segment to start targeting specific customer groups.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateSegment}
              sx={{ mt: 2 }}
            >
              Create Segment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="dashboard-maincard">
          <div className="dashboard-maincard-content" style={{padding: '16px 8px'}}>
            {segments.map((segment, idx) => (
              <div key={segment._id || idx}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{segment.name}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {segment.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {segment.audienceSize} customers
                        </Typography>
                      </Box>
                      <Chip 
                        size="small" 
                        label={segment.isActive ? "Active" : "Inactive"} 
                        color={segment.isActive ? "success" : "default"}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditSegment(segment._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteSegment(segment._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
                {idx < segments.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}