import Reacts from 'react';
import { Card, CardConects, Typography } from '@mui/material';

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
        <CardConects>
            <Typography variant="h3" fontWeight="bold">{value}</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{title}</Typography>            
        </CardConects>
    </Card>
));

StatsCard.displayName = 'StatsCard';