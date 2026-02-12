import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Content from './pages/Content';
import CreatePost from './pages/CreatePost';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';
import ManageEditors from './pages/ManageEditors';
import TrashPage from './pages/Trash';
import Workbench from './pages/Workbench';
import Setup from './pages/Setup';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import EditorLayout from './layouts/EditorLayout';
import { useAppLogic } from './hooks/app/useAppLogic';

function App() {
  const {
    isSidebarOpen,
    isConfigured,
    user,
    checking,
    welcomeToast,
    setWelcomeToast,
    handleSetupComplete,
    handleLogin,
    closeSidebar,
    openSidebar,
    viewMode
  } = useAppLogic();

  if (checking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const withLayout = (component: React.ReactNode) => {
    const Layout = (viewMode === 'Administrator') ? AdminLayout : EditorLayout;
    return (
      <Layout
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={closeSidebar}
        onOpenSidebar={openSidebar}
        welcomeToast={welcomeToast}
        onCloseWelcomeToast={() => setWelcomeToast(false)}
      >
        {component}
      </Layout>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/setup" element={isConfigured && !user?.isSetupMode ? <Navigate to="/login" /> : <Setup onComplete={handleSetupComplete} />} />
        <Route path="/login" element={user && !user.isSetupMode ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />

        <Route
          path="/"
          element={user ? withLayout(<Dashboard />) : <Navigate to="/login" />}
        />

        <Route
          path="/content"
          element={user ? withLayout(<Content />) : <Navigate to="/login" />}
        />

        <Route
          path="/workbench"
          element={user ? withLayout(<Workbench />) : <Navigate to="/login" />}
        />
        
        <Route 
          path="/create-post" 
          element={user ? withLayout(<CreatePost />) : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/edit/:filename" 
          element={user ? withLayout(<CreatePost />) : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/media" 
          element={user ? withLayout(<MediaLibrary />) : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/trash" 
          element={user ? withLayout(<TrashPage />) : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/settings" 
          element={user ? withLayout(<Settings />) : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/editors" 
          element={user?.isAdmin ? withLayout(<ManageEditors />) : <Navigate to="/" />} 
        />
        
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
