import './components/HeaderPage/HeaderPage.css';
import { OrderPage } from './pages/OrderPage/OrderPage';
import Home from "./pages/Home.tsx";
import QLTK from "./pages/AccountManagement.tsx";
import QLKC from "./pages/ShiftManagement.tsx";
import Login from "./pages/Login";
import { FoodManagementPage } from './pages/FoodManagementPage/FoodManagementPage';
import ManagePL from './pages/ManagePhanLoai/ManagePhanLoaiPage';
import RevenuePage from './pages/Revenue/RevenuePage.tsx';
import ManageQuanPage from './pages/ManageQuan/ManageQuanPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter basename='/FrontendQLQA/'>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Home" element={<PrivateRoute disallowedRoles={[]} children={<Home />} />} />
          <Route path="/Order/:b_id" element={<PrivateRoute disallowedRoles={[]} children={<OrderPage />} />} />
          <Route path="/TTQ" element={<PrivateRoute disallowedRoles={[2, 3]} children={<ManageQuanPage />} />} />
          <Route path="/QLPL" element={<PrivateRoute disallowedRoles={[1, 2, 3]} children={<ManagePL />} />} />
          <Route path="/QLTK" element={<PrivateRoute disallowedRoles={[1, 2, 3]} children={<QLTK />} />} />
          <Route path="/QLKC" element={<PrivateRoute disallowedRoles={[3]} children={<QLKC />} />} />
          <Route path="/QLDT" element={<PrivateRoute disallowedRoles={[1, 2, 3]} children={<RevenuePage />} />} />
          <Route path="/QLMA" element={<PrivateRoute disallowedRoles={[2, 3]} children={<FoodManagementPage />} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App