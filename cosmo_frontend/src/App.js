import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Logo from '../src/components/images/salem-cosmetic-logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DoctorLogin, PharmacistLogin, ReceptionistLogin } from './components/Login';
import Pharmacy from './components/Pharmacy';
import Reception from './components/Reception';
import Doctor from './components/Doctor';
import HomePage from './components/HomePage';
import PatientDetails from './components/PatientDetails';
import Appointment from './components/Appointments';
import BookedAppointments from './components/BookedAppointments';
import Prescription from './components/Prescription';
import SignOut from './components/SignOut';
import VitalForm from './components/VitalForm';
import Bill from './components/Bill';
import DoctorLoginHeader from './components/DoctorLoginHeader';
import ReceptionistLoginHeader from './components/ReceptionistLoginHeader';
import PharmacyLoginHeader from './components/PharmacyLoginHeader';
import BillingReport from './components/BillingReport';
import BillingProcedureReport from './components/BillingProcedureReport';
import SummaryReport from './components/SummaryReport';
import MedicalHistory from './components/MedicalHistory';
import './App.css';
import ProcedureComponent from './components/ProcedureBill';
import Report from './components/Report';


function App() {
  const location = useLocation();
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  useEffect(() => {
    console.log('Current user role from localStorage:', localStorage.getItem('userRole')); // Debug log
    setUserRole(localStorage.getItem('userRole'));
  }, [location]);

  const isLoggedIn = userRole !== null;
  const shouldShowLogo = !(
    (location.pathname.startsWith('/Doctor') && location.pathname !== '/DoctorLogin') ||
    (location.pathname.startsWith('/Reception') && location.pathname !== '/ReceptionistLogin') ||
    (location.pathname.startsWith('/Pharmacy') && location.pathname !== '/PharmacistLogin') 
  );

  const shouldShowDoctorHeader = isLoggedIn && location.pathname.startsWith('/Doctor') && location.pathname !== '/DoctorLogin';
  const shouldShowReceptionistHeader = isLoggedIn && location.pathname.startsWith('/Reception') && location.pathname !== '/ReceptionistLogin';
  const shouldShowPharmacistHeader = isLoggedIn && location.pathname.startsWith('/Pharmacy') && location.pathname !== '/PharmacistLogin';

  return (
    <div className="App">
      {(shouldShowLogo || location.pathname === '/DoctorLogin') && (
        <div className="logo-container">
          <img src={Logo} alt="Shanmuga Hospital Logo" className="logo" />
        </div>
      )}
      {shouldShowDoctorHeader && <DoctorLoginHeader />}
      {shouldShowReceptionistHeader && <ReceptionistLoginHeader />}
      {shouldShowPharmacistHeader && <PharmacyLoginHeader />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/PharmacistLogin" element={<PharmacistLogin setUserRole={setUserRole} />} />
          <Route path="/DoctorLogin" element={<DoctorLogin setUserRole={setUserRole} />} />
          <Route path="/ReceptionistLogin" element={<ReceptionistLogin setUserRole={setUserRole} />} />
          <Route path="/Pharmacy" element={<Pharmacy />} />
          <Route path="/VitalForm" element={<VitalForm />} />
          <Route path="/BillingProcedureReport" element={<BillingProcedureReport />} />

          {/* Doctor routes */}
          <Route path="/Doctor/*" element={isLoggedIn && userRole === 'doctor' ? <Doctor appointments={[]} /> : <Navigate to="/" />} />
          <Route path="/Doctor/BookedAppointments" element={<BookedAppointments />} />
          <Route path="/Doctor/PatientDetails" element={<PatientDetails />} />
          <Route path="/Doctor/BillingReport" element={<BillingReport />} />
          <Route path="/Doctor/SummaryReport" element={<SummaryReport />} />
          <Route path="/Doctor/Report" element={<Report />} />
          <Route path="/Doctor/BillingProcedureReport" element={<BillingProcedureReport />} />
          <Route path="/Doctor/Prescription" element={<Prescription />} />

          {/* Receptionist routes */}
          <Route path="/Reception/*" element={isLoggedIn && userRole === 'receptionist' ? <Reception /> : <Navigate to="/" />} />
          <Route path="/Reception/Appointment" element={<Appointment />} />
          <Route path="/Reception/PatientDetails" element={<PatientDetails />} />
          <Route path="/Reception/Bill" element={<Bill />} />
          <Route path="/Reception/ProcedureBill" element={<ProcedureComponent />} />

          {/* Default redirections */}
          {isLoggedIn && (
            <>
              <Route path="/DoctorLogin/*" element={<Navigate to="/Doctor/BookedAppointments" />} />
              <Route path="/ReceptionistLogin/*" element={<Navigate to="/Reception/PatientDetails" />} />
            </>
          )}

          {/* Redirect all unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
