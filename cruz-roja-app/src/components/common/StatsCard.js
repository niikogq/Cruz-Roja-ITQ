import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export const StatsCard = React.memo(({
    title,
    value,
    gradient,
    shadowColor
}) => (
    <Card sx={{
        background: gradient,
        color: '#fff',
        boxShadow: `0 4px 12px ${shadowColor}`
    }}>
        <CardContent>
            <Typography variant="h3" fontWeight="bold">{value}</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{title}</Typography>            
        </CardContent>
    </Card>
));

StatsCard.displayName = 'StatsCard';