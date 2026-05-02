import React, {createContext, useContext} from 'react';
import {theme as defaultTheme, AppTheme} from './tokens';

const ThemeContext = createContext<AppTheme>(defaultTheme);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => <ThemeContext.Provider value={defaultTheme}>{children}</ThemeContext.Provider>;

export const useTheme = (): AppTheme => useContext(ThemeContext);
