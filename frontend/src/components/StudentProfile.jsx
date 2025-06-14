import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Button,
  Grid,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const StudentProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('contest');
  const [timeRange, setTimeRange] = useState('30');
  const [ratingData, setRatingData] = useState([]);
  const [problemStats, setProblemStats] = useState({
    totalSolved: 0,
    averagePerDay: 0,
    averageProblemRating: 0,
    mostDifficultProblem: null,
    submissionsByDay: [],
    problemsByRating: []
  });
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch Codeforces rating history
  useEffect(() => {
    const fetchRatingHistory = async () => {
      if (!user.codeforcesId) return;

      try {
        const res = await fetch(`https://codeforces.com/api/user.rating?handle=${user.codeforcesId}`);
        const data = await res.json();

        if (data.status === 'OK') {
          const filtered = data.result.map((entry) => ({
            name: new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
            rating: entry.newRating,
            timestamp: entry.ratingUpdateTimeSeconds * 1000,
          }));

          setRatingData(filtered);
        }
      } catch (error) {
        console.error('Error fetching rating history:', error);
      }
    };

    fetchRatingHistory();
  }, [user.codeforcesId]);

  // Fetch problem solving statistics
  useEffect(() => {
    const fetchProblemStats = async () => {
      if (!user.codeforcesId) return;
      
      setIsLoadingProblems(true);
      
      try {
        const res = await fetch(`https://codeforces.com/api/user.status?handle=${user.codeforcesId}`);
        const data = await res.json();

        if (data.status === 'OK') {
          // Get unique solved problems (only count "OK" verdicts)
          const solvedProblems = data.result
            .filter(submission => submission.verdict === 'OK')
            .reduce((acc, submission) => {
              const problemId = `${submission.problem.contestId}${submission.problem.index}`;
              if (!acc.has(problemId)) {
                acc.set(problemId, submission.problem);
              }
              return acc;
            }, new Map());

          // Calculate total solved
          const totalSolved = solvedProblems.size;

          // Calculate average per day (assuming last 30 days of activity)
          const today = new Date();
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          
          const recentSubmissions = data.result.filter(submission => {
            const submissionDate = new Date(submission.creationTimeSeconds * 1000);
            return submissionDate >= thirtyDaysAgo;
          });
          
          const uniqueDays = new Set(recentSubmissions.map(submission => {
            const date = new Date(submission.creationTimeSeconds * 1000);
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          }));
          
          const averagePerDay = uniqueDays.size > 0 ? (totalSolved / uniqueDays.size).toFixed(1) : 0;

          // Find most difficult problem
          let mostDifficultProblem = null;
          let highestRating = 0;
          
          solvedProblems.forEach(problem => {
            if (problem.rating && problem.rating > highestRating) {
              highestRating = problem.rating;
              mostDifficultProblem = problem;
            }
          });

          // Calculate average problem rating
          const problemsWithRating = Array.from(solvedProblems.values()).filter(p => p.rating);
          const averageProblemRating = problemsWithRating.length > 0 ?
            Math.round(problemsWithRating.reduce((sum, p) => sum + p.rating, 0) / problemsWithRating.length) : 0;

          // Group problems by rating range
          const ratingRanges = [
            { name: '800-1000', range: [800, 1000], count: 0 },
            { name: '1000-1500', range: [1001, 1500], count: 0 },
            { name: '1500-2000', range: [1501, 2000], count: 0 },
            { name: '2000+', range: [2001, Infinity], count: 0 }
          ];

          problemsWithRating.forEach(problem => {
            const range = ratingRanges.find(r => 
              problem.rating >= r.range[0] && problem.rating <= r.range[1]
            );
            if (range) range.count++;
          });

          // Create submission heatmap data
          const submissionsByDay = {};
          
          data.result.forEach(submission => {
            const date = new Date(submission.creationTimeSeconds * 1000);
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            if (!submissionsByDay[dateStr]) {
              submissionsByDay[dateStr] = 0;
            }
            submissionsByDay[dateStr]++;
          });

          const heatmapData = Object.keys(submissionsByDay).map(date => ({
            date,
            count: submissionsByDay[date]
          }));

          setProblemStats({
            totalSolved,
            averagePerDay,
            averageProblemRating,
            mostDifficultProblem,
            submissionsByDay: heatmapData,
            problemsByRating: ratingRanges
          });
        }
      } catch (error) {
        console.error('Error fetching problem statistics:', error);
      } finally {
        setIsLoadingProblems(false);
      }
    };

    fetchProblemStats();
  }, [user.codeforcesId]);

  const getFilteredData = () => {
    const now = Date.now();
    const days = parseInt(timeRange, 10);
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return ratingData.filter((d) => d.timestamp >= cutoff);
  };

  // Get color based on count for heatmap
  const getColor = (count) => {
    if (!count) return 'color-empty';
    if (count < 3) return 'color-scale-1';
    if (count < 6) return 'color-scale-2';
    if (count < 9) return 'color-scale-3';
    return 'color-scale-4';
  };

  // Get today and 6 months ago for heatmap
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  return (
    <Box sx={{ width: '120%' }}>
      {/* User Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>{user.name}</Typography>
        <Typography variant="body1" color="text.secondary">{user.email}</Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Phone Number</Typography>
          <Typography variant="body1">+{user.contact}</Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Codeforces Handle</Typography>
          <Typography variant="body1">{user.codeforcesId}</Typography>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="subtitle2">Current Rating</Typography>
            <Typography variant="h6">{user.currentRating}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Max Rating</Typography>
            <Typography variant="h6">{user.maxRating}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="contest" label="Contest History" />
        <Tab value="problem" label="Problem Solving" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 'contest' && (
          <Box>
            {/* Time Range Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {['30', '90', '365'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'contained' : 'outlined'}
                  onClick={() => setTimeRange(range)}
                  size="small"
                >
                  Last {range} Days
                </Button>
              ))}
            </Box>

            {/* Rating History Chart */}
            <Typography variant="h6" sx={{ mb: 1 }}>Rating History</Typography>
            <Paper variant="outlined" sx={{ height: 300, p: 2 }}>
              {ratingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rating" stroke="#1976d2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" align="center">
                  No rating data available.
                </Typography>
              )}
            </Paper>

            {/* Contest Participation Placeholder */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Contest Participation</Typography>
            <Paper variant="outlined" sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Contest participation data would appear here</Typography>
            </Paper>
          </Box>
        )}

        {activeTab === 'problem' && (
          <Box>
            {isLoadingProblems ? (
              <Typography>Loading problem statistics...</Typography>
            ) : (
              <Grid container spacing={3}>
                {/* Problem Solving Stats */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Problem Solving Stats</Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Total Problems Solved</Typography>
                      <Typography variant="h4">{problemStats.totalSolved}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Average Per Day</Typography>
                      <Typography variant="h4">{problemStats.averagePerDay}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Average Problem Rating</Typography>
                      <Typography variant="h4">{problemStats.averageProblemRating}</Typography>
                    </Box>
                    
                    {problemStats.mostDifficultProblem && (
                      <Box>
                        <Typography variant="subtitle2">Most Difficult Problem Solved</Typography>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="body1">
                            {problemStats.mostDifficultProblem.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Rating: {problemStats.mostDifficultProblem.rating}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {problemStats.mostDifficultProblem.tags?.join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                
                {/* Problems by Rating */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Problems by Rating</Typography>
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={problemStats.problemsByRating}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Submission Heat Map */}
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Submission Heat Map</Typography>
                    <Box sx={{ mt: 2 }}>
                      <CalendarHeatmap
                        startDate={sixMonthsAgo}
                        endDate={today}
                        values={problemStats.submissionsByDay}
                        classForValue={(value) => getColor(value?.count)}
                        tooltipDataAttrs={(value) => {
                          if (!value || !value.date) return null;
                          return {
                            'data-tip': `${value.date}: ${value.count || 0} submissions`,
                          };
                        }}
                      />
                      
                      {/* Legend */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: '#ebedf0', mr: 0.5 }} />
                            <Typography variant="caption">0</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: '#c6e48b', mr: 0.5 }} />
                            <Typography variant="caption">1-2</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: '#7bc96f', mr: 0.5 }} />
                            <Typography variant="caption">3-5</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: '#239a3b', mr: 0.5 }} />
                            <Typography variant="caption">6-8</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: '#196127', mr: 0.5 }} />
                            <Typography variant="caption">9+</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StudentProfile;
