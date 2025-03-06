import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Transactions from './pages/Transactions';
import Summary from './pages/Summary';
import { useEffect } from 'react';
import './App.scss';
import { useAuth, AuthProvider } from './context/AuthContext';
import Lending from './pages/Lending';
import Income from './pages/Income';
import Loading from './components/Loading';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import { InstallPrompt } from './components/InstallPrompt';
import 'regenerator-runtime/runtime';
import ChatBot from './components/ChatBot/ChatBot';

const AppContent = () => {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;
  const navigate = useNavigate();
  const location = useLocation();
  const loginToastShown = React.useRef(false);
  const isInitialMount = React.useRef(true);
  const [appReady, setAppReady] = React.useState(false);
  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      if (!loading) {
        try {
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
              // Don't wait for update, just check status
              registration.update().catch(console.error);
            }
          }
          // Immediately set app as ready
          setAppReady(true);
        } catch (error) {
          console.error('App initialization error:', error);
          setAppReady(true);
        }
      }
    };

    initializeApp();
  }, [loading]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!loading && user && location.pathname === '/transactions' && !loginToastShown.current) {
      toast.success('Successfully logged in!', {
        style: { background: '#4caf50', color: 'white' }
      });
      loginToastShown.current = true;
    }

    if (!user) {
      loginToastShown.current = false;
    }
  }, [user, loading, location.pathname]);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!loading && !user && navigate) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  if (loading) {
    return <Loading message="Initializing app..." />;
  }
  if (!appReady) {
    return <Loading message="Loading application..." />;
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/transactions" replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route 
          path="/transactions" 
          element={user ? <Transactions /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/summary" 
          element={user ? <Summary /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/lending" 
          element={user ? <Lending /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/income" 
          element={user ? <Income /> : <Navigate to="/" replace />} 
        />
        <Route
          path="/dashboard"
          element={user? <Dashboard /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <ChatBot />} {/* Only render ChatBot for authenticated users */}
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <InstallPrompt />
        <ToastContainer
          position="bottom-center"
          autoClose={500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        />
      </AuthProvider>
    </Router>
  );
}