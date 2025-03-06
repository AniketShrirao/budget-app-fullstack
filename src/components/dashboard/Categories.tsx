import { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Typography,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addCategory, updateCategory, deleteCategory, fetchCategories } from '../../features/categorySlice';
import { fetchTypes } from '../../features/typeSlice';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { Button } from '../../design-system/components/Button';

const Categories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useAuth();
  const userId = auth?.user?.id;
  const categories = useSelector((state: RootState) => state.categories.categories);
  const types = useSelector((state: RootState) => state.types.types);
  
  useEffect(() => {
    dispatch(fetchCategories());
    if (userId) {
      dispatch(fetchTypes(userId));
    }
  }, [dispatch]);

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    type: 'Needs',
    color: '#1976d2',
    icon: '💰'
  });

  const handleOpen = (category?: any) => {
    if (category) {
      setEditItem(category);
      setFormData({
        title: category.title,
        type: category.type,
        color: category.color || '#1976d2',
        icon: category.icon || '💰'
      });
    } else {
      setEditItem(null);
      setFormData({
        title: '',
        type: 'Needs',
        color: '#1976d2',
        icon: '💰'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
  };

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await dispatch(updateCategory({ id: editItem.id, updates: { ...formData, is_default: editItem.is_default } })).unwrap();
        setShowAlert({ show: true, message: 'Category updated successfully!', type: 'success' });
      } else {
        await dispatch(addCategory({ ...formData, is_default: false })).unwrap();
        setShowAlert({ show: true, message: 'Category added successfully!', type: 'success' });
      }
      handleClose();
    } catch (error) {
      setShowAlert({ 
        show: true, 
        message: 'Error processing category. Please try again.', 
        type: 'error' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Get category title first
      const categoryToDelete = categories.find(cat => cat.id === id);
      if (!categoryToDelete) {
        toast.error('Category not found');
        return;
      }

      // Check for linked transactions using category title
      const { data: linkedTransactions, error: txError } = await supabase
        .from('transactions')
        .select('id')
        .eq('category', categoryToDelete.title);

      if (txError) throw txError;

      if (linkedTransactions && linkedTransactions.length > 0) {
        toast.error(`Cannot delete category: ${linkedTransactions.length} transaction(s) are using this category. Please update or delete those transactions first.`, { autoClose: 5000 });
        return;
      }

      if (window.confirm('Are you sure you want to delete this category?')) {
        try {
          await dispatch(deleteCategory(id)).unwrap();
          setShowAlert({ show: true, message: 'Category deleted successfully!', type: 'success' });
        } catch (error) {
          setShowAlert({ 
            show: true, 
            message: 'Error deleting category. Please try again.', 
            type: 'error' 
          });
        }
      }
    } catch (error) {
      toast.error('Error checking category usage. Please try again.');
    }
  };

  // Update the ListItem to show disabled delete button if category has transactions
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Manage Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <List>
          {categories.map((category) => (
            <ListItem
              key={category.id}
              sx={{
                borderLeft: `4px solid ${(category as { color?: string }).color || '#1976d2'}`,
                mb: 1,
                backgroundColor: 'background.paper'
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{(category as { icon?: string }).icon || '💰'}</span>
                    {category.title}
                  </Box>
                }
                secondary={
                  <Chip
                    label={category.type}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpen(category)}>
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(category.id)}
                  disabled={category.has_transactions}
                  sx={{
                    '&.Mui-disabled': {
                      color: 'rgba(0, 0, 0, 0.26)',
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Category Name"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              select
              label="Type"
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {types.map((type) => (
                <MenuItem key={type.name} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Color"
              type="color"
              fullWidth
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
            <TextField
              label="Icon (emoji)"
              fullWidth
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showAlert.show}
        autoHideDuration={6000}
        onClose={() => setShowAlert({ ...showAlert, show: false })}
      >
        <Alert 
          severity={showAlert.type as 'success' | 'error'} 
          onClose={() => setShowAlert({ ...showAlert, show: false })}
        >
          {showAlert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Categories;