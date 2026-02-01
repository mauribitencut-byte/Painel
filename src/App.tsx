import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { Dashboard } from "@/pages/Dashboard";
import { PropertiesPage } from "@/pages/properties/PropertiesPage";
import { PropertyDetailsPage } from "@/pages/properties/PropertyDetailsPage";
import { LeadsPage } from "@/pages/crm/LeadsPage";
import { RentalsPage } from "@/pages/rentals/RentalsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/imoveis" element={<PropertiesPage />} />
                <Route path="/imoveis/:id" element={<PropertyDetailsPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/locacoes" element={<RentalsPage />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
