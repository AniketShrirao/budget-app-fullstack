import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Container,
  Typography,
  useTheme
} from '@mui/material';
import Profile from '../components/dashboard/Profile';
import Settings from '../components/dashboard/Settings';
import Categories from '../components/dashboard/Categories';
import Types from '../components/dashboard/Types';
import './Dashboard.scss';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const DASHBOARD_TABS = [
  { label: "Profile", component: <Profile /> },
  { label: "Settings", component: <Settings /> },
  { label: "Categories", component: <Categories /> },
  { label: "Types", component: <Types /> }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container className='dashboard' maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ p: 2 }}>
          Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {DASHBOARD_TABS.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {DASHBOARD_TABS.map(({ label, component }, index) => (
          <TabPanel key={index} value={activeTab} index={index} className={`tab-panel-${label.toLowerCase()}`}>
            {component}
          </TabPanel>
        ))}
      </Paper>
    </Container>
  );
};

export default Dashboard;