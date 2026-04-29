import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CrmDashboardPage from "./features/crm/pages/CrmDashboardPage";
import CustomerDetailPage from "./features/crm/pages/CustomerDetailPage";
import CustomersPage from "./features/crm/pages/CustomersPage";
import ProductsPage from "./features/crm/pages/ProductsPage";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<CrmDashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/clients" element={<Navigate to="/customers" replace />} />
        <Route path="/projects" element={<Projects />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
