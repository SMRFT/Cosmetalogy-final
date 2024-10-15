import React, { useState } from 'react';
import { Form, Container, Row, Col, Alert, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { LiaFileMedicalAltSolid } from "react-icons/lia";
import './PatientForm.css'; // Import the CSS file
import styled from 'styled-components';
import VitalForm from './VitalForm'; // Import VitalForm
import { purposeOfVisit } from './constant';
// Import images
import maleIcon from './images/male-gender.png';
import femaleIcon from './images/femenine.png';
import transgenderIcon from './images/transgender.png';

const PatientForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    mobileNumber: '',
    age: '',
    gender: '',
    email: '',
    language: '',
    purposeOfVisit: '',
    customPurpose: '', // New state for custom purpose
    address: '',
  });

  const handlePurposeChange = (e) => {
    setFormData({ 
      ...formData, 
      purposeOfVisit: e.target.value, 
      customPurpose: ''  // Clear custom purpose when selecting from the dropdown
    });
  };

  const handleCustomPurposeChange = (e) => {
    setFormData({ 
      ...formData, 
      customPurpose: e.target.value, 
      purposeOfVisit: ''  // Clear dropdown selection when typing custom purpose
    });
  };

    // Store the custom purpose if typed, otherwise store the selected dropdown value
     const finalPurposeOfVisit = formData.customPurpose || formData.purposeOfVisit;

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [patientUID, setPatientUID] = useState(''); // State to store patientUID

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate mandatory fields
    if (!formData.patientName || !formData.mobileNumber) {
      setErrorMessage('Patient Name and Mobile Number are required.');
      return;
    }

    axios.post('http://127.0.0.1:8000/Patients_data/', { ...formData, purposeOfVisit: finalPurposeOfVisit })
      .then(response => {
        setSuccessMessage('Patient Data Added Successfully');
        setPatientUID(response.data.patientUID); // Set the patientUID
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.mobileNumber) {
          setErrorMessage('A patient with this mobile number already exists.');
        } else {
          setErrorMessage('There was an error submitting the form.');
        }
        console.error('There was an error submitting the form:', error);
      });
  };

  const handleModalOpen = () => setShowModal(true); // Open modal
  const handleModalClose = () => setShowModal(false); // Close modal

  return (
    <Container className="form-container">
      <VitalFormIcon className='mt-2' title='Vital Form' onClick={handleModalOpen}>
        <LiaFileMedicalAltSolid />
      </VitalFormIcon>
      <br/>
      
      <Form onSubmit={handleSubmit}>
        {/* Existing form fields */}
        <Row>
          <Col>
            <Form.Group controlId="patientName">
              <Form.Label>Patient Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="custom-input"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="mobileNumber">
              <Form.Label>Mobile Number <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="custom-input"
              />
            </Form.Group>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <Form.Group controlId="age">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="custom-input"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="gender">
              <Form.Label>Select Gender</Form.Label>
              <div className="gender-selection">
                <div className="gender-icons">
                  <div onClick={() => handleGenderSelect('Male')} className={`gender-option ${formData.gender === 'Male' ? 'selected' : ''}`}>
                    <img
                      src={maleIcon}
                      alt="Male"
                      className="gender-icon"
                    />
                    <div>Male</div>
                  </div>
                  <div onClick={() => handleGenderSelect('Female')} className={`gender-option ${formData.gender === 'Female' ? 'selected' : ''}`}>
                    <img
                      src={femaleIcon}
                      alt="Female"
                      className="gender-icon"
                    />
                    <div>Female</div>
                  </div>
                  <div onClick={() => handleGenderSelect('Unspecified')} className={`gender-option ${formData.gender === 'Unspecified' ? 'selected' : ''}`}>
                    <img
                      src={transgenderIcon}
                      alt="Unspecified"
                      className="gender-icon"
                    />
                    <div>Unspecified</div>
                  </div>
                </div>
              </div>
            </Form.Group>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="custom-input"
              />
            </Form.Group>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <Form.Group controlId="language">
              <Form.Label>Language</Form.Label>
              <Form.Control
                as="select"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="custom-input"
              >
                <option value="">Select</option>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </Form.Control>
            </Form.Group>
          </Col>
        <Col>
          <Form.Group controlId="purposeOfVisit">
            <Form.Label>Purpose of Visit</Form.Label>
            <Row className="align-items-center">
              <Col xs={5}>
                <Form.Control
                  as="select"
                  value={formData.purposeOfVisit}
                  onChange={handlePurposeChange}
                  className="custom-input mb-2"
                  disabled={formData.customPurpose !== ''} // Disable dropdown if custom purpose is typed
                >
                  <option value="">Select Purpose of Visit</option>
                  {purposeOfVisit.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Control>
              </Col>

              {/* Add 'or' text between the fields */}
              <Col xs={2} className="d-flex justify-content-center">
                <span style={{ fontSize: '1.5rem', textAlign: 'center' }}>or</span>
              </Col>

              <Col xs={5}>
                <Form.Control
                  type="text"
                  placeholder="Enter Custom Purpose"
                  value={formData.customPurpose}
                  onChange={handleCustomPurposeChange}
                  className="custom-input"
                  disabled={formData.purposeOfVisit !== ''} // Disable text input if dropdown is selected
                />
              </Col>
            </Row>
          </Form.Group>
        </Col>
      </Row>
        <br />
        <Row>
          <Col>
            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="custom-input"
              />
            </Form.Group>
          </Col>
        </Row>
        <br />
        <div className="form-footer">
          <button type="submit">Submit</button>
        </div>
        {errorMessage && <Alert variant="danger" className="mt-2">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success" className="mt-2">{successMessage}</Alert>}
      </Form>

      {/* Modal for VitalForm */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vital Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VitalForm patientUID={patientUID} patientName={formData.patientName} mobileNumber={formData.mobileNumber} onClose={handleModalClose} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

const VitalFormIcon = styled.div`
  position: absolute;
  top: 5px;
  right: 25px;
  cursor: pointer;
  font-size: 2.5rem;
  color: #865CAF;

  &:hover {
    color: #7A1CAC;
  }
`;

export default PatientForm;