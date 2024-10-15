import React, { useState } from 'react';
import { Row, Form, Alert, Col } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import './Register.css';
import { role } from './constant';

const Register = () => {
    const [validated, setValidated] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [touchedFields, setTouchedFields] = useState({});
    const [formData, setFormData] = useState({
      id: '',
      name: '',
      role: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setTouchedFields({ ...touchedFields, [id]: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        } else {
            setPasswordError('');
        }

        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            try {
                const response = await fetch('http://127.0.0.1:8000/registration/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    console.log('Data submitted successfully');
                    setFormSubmitted(true);
                } else {
                    const errorText = await response.text();
                    console.error('Failed to submit data:', errorText);
                    setError('Failed to submit data');
                }
            } catch (error) {
                console.error('Error:', error.message);
                setError('Error occurred while submitting the form');
            }
        }
        setValidated(true);
    };

    return (
        <div>
        <div className='Register'>
            <StyledContainer className='Register-container'>
                <h2 className="text-center mb-5">Registration</h2>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row className="mb-2">
                        <Col sm='4'>
                            <Form.Group controlId="id">
                                <Form.Label>ID</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={formData.id}
                                    onChange={handleChange}
                                    pattern="[a-zA-Z0-9]+"
                                    autoComplete="off"
                                    isInvalid={(touchedFields.id && !formData.id) || (formData.id && !/^[a-zA-Z0-9]+$/.test(formData.id))}
                                    style={{ border: "1px solid #DAD1E1" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formData.id && !/^[a-zA-Z0-9]+$/.test(formData.id) ? "Please enter a valid ID." : "ID is required."}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm='4'>
                            <Form.Group controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    pattern="[A-Za-z\s]+"
                                    isInvalid={(touchedFields.name && !formData.name) || (formData.name && !/^[A-Za-z\s]+$/.test(formData.name))}
                                    style={{ border: "1px solid #DAD1E1" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formData.name && !/^[A-Za-z\s]+$/.test(formData.name) ? "Please enter a valid name." : "Name is required."}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm='4'>
                        <Form.Group controlId="role">
                            <Form.Label>Role</Form.Label>
                            <Dropdown id="roleselect" onSelect={(value) => setFormData({ ...formData, role: value })} className="custom-dropdown">
                                <Dropdown.Toggle variant="light" id="dropdown-basic" style={{ minWidth: "120px", backgroundColor: "white", color: "black", border: "1px solid #DAD1E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>{formData.role || 'Select Role'}</span>
                                    <span className="caret"></span> {/* Bootstrap's built-in caret icon */}
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ minWidth: '120px', textAlign: "center", maxHeight: '250px', overflowY: 'auto', scrollbarWidth: "thin" }}>
                                    {role.map((role, index) => (
                                        <Dropdown.Item key={index} eventKey={role}>
                                            {role}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            <Form.Control.Feedback type="invalid">
                                Role is required.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    </Row>
                    <Row className="mb-2">
                    <Col>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                required
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={(touchedFields.email && !formData.email) || (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
                                autoComplete="off"
                                style={{ border: "1px solid #DAD1E1" }}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "Please enter a valid email address." : "Email is required."}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col sm="6">
                            <Form.Group controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    style={{ border: "1px solid #DAD1E1" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Password is required.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm="6">
                            <Form.Group controlId="confirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{ border: "1px solid #DAD1E1" }}
                                    isInvalid={touchedFields.confirmPassword && formData.password !== formData.confirmPassword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {touchedFields.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match." : "Please confirm your password."}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <center>
                        <button type="submit" className="mt-2">
                            Save
                        </button>
                    </center>
                    <Alert variant="success" show={formSubmitted}>
                       Registered New User Successfully.
                    </Alert>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                </Form>
            </StyledContainer>
        </div>
        </div>
    );
};

const StyledContainer = styled.div`
  padding: 20px;
  width: 100%;
  max-width: 450px;
  height: 100%;
  max-height: 400px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default Register;
