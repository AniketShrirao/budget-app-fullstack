import { ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '../design-system/theme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setTheme } from '../features/themeSlice';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const dispatch = useDispatch();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    // Initialize theme based on system preference if not set in Redux
    if (!themeMode) {
      dispatch(setTheme(prefersDarkMode ? 'dark' : 'light'));
    }
  }, [prefersDarkMode, dispatch, themeMode]);

  const theme = createAppTheme(themeMode || (prefersDarkMode ? 'dark' : 'light'));

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};