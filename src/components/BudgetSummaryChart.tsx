import { BudgetSummaryChartProps } from '../types/common';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { Card, CardContent, Typography } from '@mui/material';

import React, { useEffect } from 'react';

import NoDataAvailable from './NoDataAvailable';
import { fetchTypes } from '../features/typeSlice';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  Allocated: '#4CAF50', // Green for Allocated
  Spent: '#F44336', // Red for Spent
};

const BudgetSummaryChart: React.FC<BudgetSummaryChartProps> = ({ selectedMonth }) => {
  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const summaryData = useSelector((state: RootState) => state.summary.data);
  const types = useSelector((state: RootState) => state.types.types);
  const auth = useAuth();
  const userId = auth?.user?.id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchTypes(userId));
    }
  }, [dispatch]);

  // Filter transactions for the selected month
  const currentMonthTransactions = transactions.filter(
    (tx) => new Date(tx.date).getMonth() + 1 === Number(selectedMonth),
  );

  // Use available types instead of deriving from transactions
  const categories = types.map(type => type.name);

  if (!categories.length) {
    return (
      <Card sx={{ marginTop: 2.5, minHeight: '400px' }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            Budget Summary
          </Typography>
          <NoDataAvailable message="No budget categories defined yet" />
        </CardContent>
      </Card>
    );
  }

  const budget = summaryData[selectedMonth]?.budget ?? 100;
  const typePercentages = summaryData[selectedMonth]?.types ?? 
    types.map(type => ({ name: type.name, percentage: 100 / types.length }));

  const chartData = categories.map((typeName) => {
    const spent = currentMonthTransactions
      .filter((tx) => tx.type === typeName)
      .reduce((total, tx) => total + tx.amount, 0);

    const typeData = typePercentages.find(t => t.name === typeName) ?? 
      { name: typeName, percentage: 0 };

    return {
      type: typeName,
      Allocated: Math.round((budget * typeData.percentage) / 100),
      Spent: Math.round(spent),
    };
  });

  const hasSpentValues = chartData.some((data) => data.Spent > 0);

  if (!hasSpentValues) {
    return (
      <Card sx={{ marginTop: 2.5, minHeight: '400px' }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            Budget Summary
          </Typography>
          <NoDataAvailable message="No spending recorded for this month" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card style={{ marginTop: '20px' }}>
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom>
          Budget Summary
        </Typography>
        <div style={{ width: '100%', height: '320px', padding: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={10}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E0E0E0"
              />
              <XAxis dataKey="type" tick={{ fontSize: 14, fontWeight: 500 }} />
              <YAxis tick={{ fontSize: 14, fontWeight: 500 }} />
              <Tooltip
                formatter={(value, name) => [`₹${value}`, name]}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '500' }} />
              <Bar
                dataKey="Allocated"
                stackId="a"
                fill={COLORS.Allocated}
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="Spent"
                stackId="a"
                fill={COLORS.Spent}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetSummaryChart;