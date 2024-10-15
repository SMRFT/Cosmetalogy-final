import React, { useState, useEffect } from 'react';
import { Form, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import './Login.css';

const Login = ({ title, endpoint, setUserRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { sectionName } = location.state || {}; // Ensure sectionName has a fallback

  useEffect(() => {}, [location.state, sectionName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:8000/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, endpoint }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const userRole = responseData.role;
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userId', responseData.id);
        localStorage.setItem('userName', responseData.name);
        localStorage.setItem('userEmail', responseData.email);
        localStorage.setItem('loggedInAs', endpoint);

        setUserRole(userRole);  // Update state immediately

        setTimeout(() => {
          if (userRole === 'Pharmacist' && endpoint === 'PharmacistLogin') {
            navigate('/Pharmacy');
          } else if (userRole === 'Receptionist' && endpoint === 'ReceptionistLogin') {
            navigate('/Reception/Appointment');
          } else if (userRole === 'Doctor' && endpoint === 'DoctorLogin') {
            navigate('/Doctor/BookedAppointments');
          } else if (userRole === 'Doctor' && endpoint === 'PharmacistLogin') {
            navigate('/Pharmacy');
          } else if (userRole === 'Doctor' && endpoint === 'ReceptionistLogin') {
            navigate('/Reception/Appointment');
          } else {
            setError('Access denied');
          }
        }, 0); // No delay needed since success message is removed
      } else {
        const errorText = await response.text();
        setError(errorText || 'Invalid username or password');
      }
    } catch (error) {
      setError('An error occurred while logging in');
    }
  };

  return (
    <div className="login mt-3">
      <StyledContainer className="login-container">
        <h2 className="text-center mb-5">{title}</h2>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                required
                style={{ border: "1px solid #DAD1E1" }}
              />
              <Form.Control.Feedback type="invalid">Username is required.</Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                style={{ border: "1px solid #DAD1E1" }}
              />
              <Form.Control.Feedback type="invalid">Password is required.</Form.Control.Feedback>
            </Form.Group>
          </Row>
          {error && <div className="mb-3 text-danger">{error}</div>}
          <center>
            <button type="submit" className="mb-3">Login</button>
          </center>
        </Form>
      </StyledContainer>
    </div>
  );
};

const StyledContainer = styled.div`
  padding: 20px;
  width: 100%;
  max-width: 400px;
  height: 100%;
  max-height: 350px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const PharmacistLogin = ({ setUserRole }) => <Login title="Pharmacist Login" endpoint="PharmacistLogin" setUserRole={setUserRole} />;
const DoctorLogin = ({ setUserRole }) => <Login title="Doctor Login" endpoint="DoctorLogin" setUserRole={setUserRole} />;
const ReceptionistLogin = ({ setUserRole }) => <Login title="Receptionist Login" endpoint="ReceptionistLogin" setUserRole={setUserRole} />;

export { PharmacistLogin, DoctorLogin, ReceptionistLogin };
