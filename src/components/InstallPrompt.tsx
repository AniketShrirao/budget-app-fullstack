import { Snackbar } from '@mui/material';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { Button } from '../design-system/components/Button';

export function InstallPrompt() {
  const { isInstallable, handleInstallClick } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <Snackbar
      open={true}
      message="Install Budget Tracker for a better experience"
      action={
        <Button color="primary" size="small" onClick={handleInstallClick}>
          Install
        </Button>
      }
    />
  );
}