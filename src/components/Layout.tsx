import { LayoutProps } from '../types/common';

import Header from './Header';

const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="content-wrapper">
        {children}
      </main>
    </div>
  );
};

export default Layout;