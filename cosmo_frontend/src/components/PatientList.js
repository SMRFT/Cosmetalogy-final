import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoPersonCircleSharp, IoAdd, IoSearch } from 'react-icons/io5';
import { Modal } from 'react-bootstrap';
import PatientForm from './PatientForm';  // Ensure the path is correct
import './PatientList.css';

const PatientList = ({ onSelectPatient }) => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

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
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        fetchPatients(); // Fetch the latest patient data when the modal closes
    };

    return (
        <div className="patient">
            <header className="header1">
                <div className="search-bar">
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
                    <li key={patient.id} className="patient-item" onClick={() => onSelectPatient(patient)}>
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
            <Modal show={showModal} onHide={handleCloseModal} className="custom-modal-width">
                <Modal.Header closeButton>
                    <Modal.Title>Add Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PatientForm />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default PatientList;
