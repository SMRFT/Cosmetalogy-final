import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoPersonCircleSharp, IoAdd, IoSearch } from 'react-icons/io5';
import { Modal, Button } from 'react-bootstrap';
import PatientForm from './PatientForm';  // Ensure the path is correct
import styled from 'styled-components';
import './PatientList.css';

const PatientDetails = ({ onSelectPatient }) => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddPatientModal, setShowAddPatientModal] = useState(false);
    const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = () => {
        axios.get('http://127.0.0.1:8000/patients/')
            .then(response => {
                setPatients(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the patients!', error);
            });
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredPatients = patients.filter(patient =>
        patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mobileNumber.includes(searchTerm)
    );

    const handleAddPatientClick = () => {
        setShowAddPatientModal(true);
    };

    const handleCloseAddPatientModal = () => {
        setShowAddPatientModal(false);
        fetchPatients(); // Fetch the latest patient data when the modal closes
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        setShowPatientDetailsModal(true);
    };

    const handleClosePatientDetailsModal = () => {
        setShowPatientDetailsModal(false);
        setSelectedPatient(null);
    };

    return (
        <StyledContainer className="patient">
            <h3 className="text-center mb-2">Patient Details</h3>
            <header className="header1">
                <div className="search-bar" style={{ width: "30%" }}>
                    <IoSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Name or Mobile Number"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <IoAdd className="plus-icon" onClick={handleAddPatientClick} />
            </header>
            <ul className="patient-list">
                {filteredPatients.map(patient => (
                    <li key={patient.id} className="patient-item" onClick={() => handlePatientClick(patient)}>
                        <div className="patient-info">
                            <IoPersonCircleSharp className='person' />
                            <div>
                                <div className="patient-name">{patient.patientName}</div>
                                <div className="patient-mobile">{patient.mobileNumber}</div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <Modal show={showAddPatientModal} onHide={handleCloseAddPatientModal} className="custom-modal-width">
                <Modal.Header closeButton>
                    <Modal.Title>Add Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PatientForm />
                </Modal.Body>
            </Modal>
            {selectedPatient && (
                <Modal show={showPatientDetailsModal} onHide={handleClosePatientDetailsModal} className="custom-modal-width">
                    <Modal.Header closeButton>
                        <Modal.Title>Patient Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Patient Id:</strong> {selectedPatient.patientUID}</p>
                        <p><strong>Patient Name:</strong> {selectedPatient.patientName}</p>
                        <p><strong>Mobile Number:</strong> {selectedPatient.mobileNumber}</p>
                        <p><strong>Age:</strong> {selectedPatient.age}</p>
                        <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                        <p><strong>Email:</strong> {selectedPatient.email}</p>
                        <p><strong>Language:</strong> {selectedPatient.language}</p>
                        <p><strong>Purpose Of Visit:</strong> {selectedPatient.purposeOfVisit}</p>
                        <p><strong>Address:</strong> {selectedPatient.address}</p>
                    </Modal.Body>
                </Modal>
            )}
        </StyledContainer>
    );
};

const StyledContainer = styled.div`
    margin-top: 65px;
`;

export default PatientDetails;
