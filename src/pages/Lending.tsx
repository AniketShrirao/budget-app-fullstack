import { useRef } from 'react';
import AddLendingForm from "../components/AddLendingForm";
import LendingReminders from "../components/LendingReminders";
import { Container } from '@mui/material';
import './Lending.scss';

const Lending = () => {
  const lendingRemindersRef = useRef<{ checkReminders: () => void } | null>(null);

  const handleAddLending = () => {
    if (lendingRemindersRef.current) {
      lendingRemindersRef.current.checkReminders();
    }
  };

  return (
    <Container className="lending-container" maxWidth={false}>
      <div className="lending-grid">
        <div className="lending-form">
          <AddLendingForm onAddLending={handleAddLending} />
        </div>
        <div className="lending-table">
          <LendingReminders ref={lendingRemindersRef} />
        </div>
      </div>
    </Container>
  );
};

export default Lending;