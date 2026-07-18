import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

const activities = [
  { text: 'Project "TaskFlow AI" created', time: '10 mins ago', color: 'primary.main' },
  { text: 'User "Karthik" joined', time: '1 hour ago', color: 'success.main' },
  { text: 'Login API completed', time: '3 hours ago', color: 'info.main' },
  { text: 'Sprint started', time: 'Yesterday', color: 'warning.main' },
];

const ActivityFeed = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Recent Activities
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Timeline
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {activities.map((activity, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: activity.color }} />
                {index < activities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" fontWeight="500">{activity.text}</Typography>
                <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Paper>
  );
};

export default ActivityFeed;
