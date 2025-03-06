import { BudgetSummaryTableProps } from '../types/common';
import { Alert, Box, Card, CardContent, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonthlySummary, updateMonthlySummary } from '../features/summarySlice';
import { store } from '../store';
import { Transaction } from '../types/transaction';
import { toast } from 'react-toastify';
import { TypeSummary } from '../types/type';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RootState } from '../store';
import { Button } from '../design-system/components/Button';

const BudgetSummaryTable: React.FC<BudgetSummaryTableProps> = ({
  className,
  userId,
  selectedMonth,
  parentTransactions,
}) => {
  const dispatch = useDispatch<typeof store.dispatch>();
  const types = useSelector((state: RootState) => state.types.types);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempTypes, setTempTypes] = useState<TypeSummary[]>([]);
  const [currentMonthTransactions, setCurrentMonthTransactions] = useState<Transaction[]>([]);
  const [modifiedTypes, setModifiedTypes] = useState<{ [key: string]: boolean }>({});
  const [totalError, setTotalError] = useState('');
  const [localBudget, setLocalBudget] = useState<string>('');
  const { data, error } = useSelector((state: RootState) => state.summary);
  
  useEffect(() => {
    if (types.length) {
      const currentTypes = data[selectedMonth]?.types;
      if (!currentTypes?.length) {
        // Initialize with available types
        const defaultTypes = types.map(type => ({
          name: type.name,
          percentage: 100 / types.length
        }));
        setTempTypes(defaultTypes);
      } else {
        // Ensure all types are present
        const updatedTypes = types.map(type => {
          const existing = currentTypes.find(t => t.name === type.name);
          return existing || { name: type.name, percentage: 0 };
        });
        setTempTypes(updatedTypes);
      }
    }
  }, [data, selectedMonth, types]);

  useEffect(() => {
    if (data[selectedMonth]?.types?.length) {
      setTempTypes(data[selectedMonth].types);
    } else if (types.length) {
      const defaultTypes = types.map(type => ({
        name: type.name,
        percentage: 100 / types.length
      }));
      setTempTypes(defaultTypes);
    }
  }, [data, selectedMonth, types]);
  useEffect(() => {
    dispatch(fetchMonthlySummary({ userId, month: selectedMonth }));
  }, [dispatch, userId, selectedMonth]);
  useEffect(() => {
    setCurrentMonthTransactions(
      parentTransactions?.length
        ? parentTransactions
        : data[selectedMonth]?.transactions || [],
    );
  }, [parentTransactions, data, selectedMonth]);
  useEffect(() => {
    setLocalBudget(data[selectedMonth]?.budget?.toString() ?? '100');
  }, [data, selectedMonth]);
  const budget = data[selectedMonth]?.budget ?? 100;
  const calculateSpent = (categoryName: string): number => {
    return currentMonthTransactions
      ?.filter(
        (transaction: Transaction) =>
          transaction.type === categoryName &&
          new Date(transaction.date).getMonth() + 1 === Number(selectedMonth),
      )
      .reduce((total: number, transaction: Transaction) => total + transaction.amount, 0);
  };
  const handleBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBudget(e.target.value);
  }, []);
  const handleBudgetBlur = useCallback(() => {
    const newValue = Number(localBudget);
    if (!isNaN(newValue) && newValue !== data[selectedMonth]?.budget) {
      dispatch(updateMonthlySummary({
        userId,
        month: selectedMonth,
        updatedSummary: {
          ...data[selectedMonth],
          budget: newValue
        }
      }));
    } else {
      setLocalBudget(data[selectedMonth]?.budget?.toString() ?? '100');
    }
    setIsEditingBudget(false);
  }, [localBudget, userId, selectedMonth, data]);
  const BudgetInput = useMemo(() => (
    <TextField
      type="number"
      value={localBudget}
      onChange={handleBudgetChange}
      onBlur={handleBudgetBlur}
      placeholder="Enter monthly salary"
      fullWidth
      size="small"
      autoFocus
      InputProps={{
        startAdornment: <InputAdornment position="start">₹</InputAdornment>
      }}
    />
  ), [localBudget, handleBudgetChange, handleBudgetBlur]);
  const handlePercentageChange = (name: string, value: string) => {
    setTempTypes(prevTypes => 
      prevTypes.map(type =>
        type.name === name ? { ...type, percentage: parseInt(value, 10) || 0 } : type
      )
    );
  };
  const handleBlur = (name: string) => {
    setModifiedTypes(prev => ({ ...prev, [name]: true }));
  };
  const handleUpdateSummary = () => {
    const hasModifiedTypes = Object.values(modifiedTypes).some(modified => modified);
  
    if (!hasModifiedTypes) {
      toast.error('No changes to update');
      return;
    }
  
    const totalModified = tempTypes
      .filter(type => modifiedTypes[type.name])
      .reduce((sum, type) => sum + type.percentage, 0);
  
    const remainingPercentage = 100 - totalModified;
    const unmodifiedTypes = tempTypes.filter(
      type => !modifiedTypes[type.name]
    );
  
    const totalUnmodifiedPercent = unmodifiedTypes.reduce(
      (sum, type) => sum + type.percentage,
      0
    );
  
    let finalTypes = tempTypes.map(type => {
      if (!modifiedTypes[type.name]) {
        const newPercentage = totalUnmodifiedPercent > 0
          ? (type.percentage / totalUnmodifiedPercent) * remainingPercentage
          : remainingPercentage / unmodifiedTypes.length;
        return { ...type, percentage: newPercentage };
      }
      return type;
    });
  
    const newTotal = finalTypes.reduce((sum, type) => sum + type.percentage, 0);
  
    if (Math.abs(newTotal - 100) > 0.01) {
      setTotalError('The total percentage must be exactly 100%');
      return;
    }
  
    setTotalError('');
    setTempTypes(finalTypes);
  
    dispatch(
      updateMonthlySummary({
        userId,
        month: selectedMonth,
        updatedSummary: {
          ...data[selectedMonth],
          types: finalTypes,
          transactions: currentMonthTransactions,
        },
      })
    ).then(() => {
      toast.success('Budget summary updated successfully!');
    });
  };
  return (
    <Card className={className} sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          sx={{
            gap: '20px',
            minHeight: '40px',
          }}
        >
          <Typography variant="h6">Monthly Salary</Typography>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ minWidth: '120px' }}
          >
            {isEditingBudget ? (
              BudgetInput
            ) : (
              <Typography
                variant="h6"
                sx={{ minWidth: '80px', textAlign: 'right' }}
              >
                ₹{budget.toFixed()}
              </Typography>
            )}
            <IconButton
              size="small"
              onClick={() => setIsEditingBudget(!isEditingBudget)}
            >
              <Pencil size={18} />
            </IconButton>
          </Box>
        </Box>

        <Box>
          {tempTypes.map((type) => (
            <Box
              key={type.name}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={1}
              py={1}
            >
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {type.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Allocated: ₹{((budget * type.percentage) / 100).toFixed()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Spent: ₹{calculateSpent(type.name).toFixed()}
                </Typography>
              </Box>
              <TextField
                type="number"
                size="small"
                sx={{ width: 60 }}
                value={type.percentage.toFixed()}
                onChange={(e) => handlePercentageChange(type.name, e.target.value)}
                onBlur={() => handleBlur(type.name)}
              />
            </Box>
          ))}
        </Box>

        {totalError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {totalError}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, width: '100%' }}
        onClick={handleUpdateSummary}
      >
        Update Summary
      </Button>
    </Card>
  );
};

export default React.memo(BudgetSummaryTable);
