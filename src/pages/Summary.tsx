import { useEffect } from 'react';
import SummaryTabs from '../components/SummaryTabs';
import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Summary = () => {
  const authContext = useAuth();
  const user = authContext?.user;
  const loading = authContext?.loading;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/');
  }, [user, dispatch, loading, navigate]);

  return (
    <div className="wrapper">
      <SummaryTabs />
    </div>
  );
};

export default Summary;
