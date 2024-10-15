import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Alert, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import PatientList from './PatientList'; // Import the PatientList component
import axios from 'axios';

const Appointment = ({}) => {
    const [alertMessage, setAlertMessage] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // State for selected slot
    const [showPatientList, setShowPatientList] = useState(false); // State for patient list modal
    const [appointmentsData, setAppointmentsData] = useState([]); // State for appointments data
    const datePickerRef = useRef(null);

    useEffect(() => {
        const interval = 30;
        setTimeSlots(getTimeSlotsForDate(new Date(), interval));
        fetchAppointments();
    }, []);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const fetchAppointments = () => {
        axios.get('http://127.0.0.1:8000/AppointmentView/')
            .then(response => {
                setAppointmentsData(response.data);
            })
            .catch(error => {
                console.error('Error fetching appointments:', error);
            });
    };

    const generateTimeSlots = (startTime, endTime, interval) => {
        const slots = [];
        let current = startTime;
        while (current < endTime) {
            const next = new Date(current.getTime() + interval * 60000);
            slots.push(`${current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
            current = next;
        }
        return slots;
    };

    const getTimeSlotsForDate = (date, interval) => {
        const startTime = new Date(date.setHours(10, 0, 0, 0));
        const endTime = new Date(date.setHours(20, 0, 0, 0));
        return generateTimeSlots(startTime, endTime, interval);
    };

    const handleBookAppointment = (slot) => {
        setSelectedSlot(slot);
        setShowPatientList(true); // Show patient list modal
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setTimeSlots(getTimeSlotsForDate(new Date(date), 30));
        setAlertMessage(null);
        setShowDatePicker(false);
    };

    const handleCloseAlert = () => {
        setAlertMessage(null);
        setIsCreatingAppointment(false);
    };

    const handleSelectPatient = (patient) => {
        const appointmentData = {
            patientUID: patient.patientUID,
            patientName: patient.patientName,
            mobileNumber: patient.mobileNumber,
            appointmentTime: selectedSlot,
            appointmentDate: selectedDate.toISOString().split('T')[0],
        };

        // Check if the patient has an appointment on the same date
        const hasAppointmentSameDate = appointmentsData.some(appointment =>
            appointment.appointmentDate === appointmentData.appointmentDate &&
            appointment.mobileNumber === appointmentData.mobileNumber
        );

        if (hasAppointmentSameDate) {
            setAlertMessage(`Patient with mobile number ${patient.mobileNumber} already has an appointment on ${appointmentData.appointmentDate}`);
            setShowPatientList(false);
            setIsCreatingAppointment(false);
            return;
        }

        // If not booked, proceed to save the appointment
        axios.post('http://127.0.0.1:8000/Appointmentpost/', appointmentData)
            .then(response => {
                console.log("Appointment saved:", response.data);
                setAlertMessage(`Appointment booked for ${selectedSlot} with ${patient.patientName}`);
                setShowPatientList(false);
                setIsCreatingAppointment(false);
                fetchAppointments(); // Update appointments data after booking
            })
            .catch(error => {
                console.error('There was an error saving the appointment!', error);
            });
    };

    // Function to check if a slot is already booked
    const isSlotBooked = (slot) => {
        const isBooked = appointmentsData.some(appointment =>
            appointment.appointmentDate === selectedDate.toISOString().split('T')[0] &&
            appointment.appointmentTime === slot
        );

        return isBooked;
    };

    return (
        <StyledContainer>
        <h3 className="text-center mb-4" >Appointment</h3>
        <AppointmentContainer>
            <ListGroupContainer>
                <div className="text-center mb-4">
                    <DateDisplay onClick={() => setShowDatePicker(!showDatePicker)}>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: "#C85C8E" }} />
                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </DateDisplay>
                    {showDatePicker && (
                        <DatePickerWrapper ref={datePickerRef}>
                            <DatePicker
                                selected={selectedDate}
                                onChange={handleDateChange}
                                inline
                            />
                        </DatePickerWrapper>
                    )}
                </div>
                {alertMessage && <Alert style={{fontSize:"0.9rem"}} variant="success">{alertMessage}</Alert>}
                {!isCreatingAppointment ? (
                    <CenteredButtonContainer>
                        <button onClick={() => setIsCreatingAppointment(true)}>Book Appointment</button>
                    </CenteredButtonContainer>
                ) : (
                    <ListContainer>
                        {timeSlots.map((slot, index) => (
                            <SlotButton
                                key={index}
                                onClick={() => handleBookAppointment(slot)}
                                disabled={isSlotBooked(slot)} // Disable booked slots
                                isSelected={selectedSlot === slot} // Highlight selected slot
                            >
                                {slot}
                            </SlotButton>
                        ))}
                    </ListContainer>
                )}
            </ListGroupContainer>
            <Modal show={showPatientList} onHide={() => setShowPatientList(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select a Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PatientList onSelectPatient={handleSelectPatient} />
                </Modal.Body>
            </Modal>
            </AppointmentContainer>
        </StyledContainer>
    );
};
const StyledContainer = styled(Container)`
    margin-top: 65px;
`;
const AppointmentContainer = styled(Container)`
    padding: 20px;
    max-width: 700px;
    background-color: #725F83;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ListGroupContainer = styled(Container)`
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 400px;
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 400px;
    overflow-y: auto;
    width: 100%;
    margin: 0 auto;
    gap: 10px;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }
`;

const CenteredButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const DateDisplay = styled.div`
    padding: 10px;
    font-size: 16px;
    width: fit-content;
    margin: 0 auto;
    cursor: pointer;
    position: relative;
    color: #C85C8E;
    font-weight: bold;
`;

const DatePickerWrapper = styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 10px;
`;

const SlotButton = styled(Button)`
    padding: 0.5rem 1rem;
    font-size: 16px;
    border: 1px solid #BCAEC7;
    background-color: #fff;
    color: #BCAEC7;
    border-radius: 20px;
    transition: all 0.3s;
    ${(props) => props.isSelected && `
        background-color: #BCAEC7;
        color: #fff;
    `}
    ${(props) => props.disabled && `
        background-color: #BCAEC7 !important;
        color: #fff;
        border: none;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        cursor: not-allowed;
    `}
    &:hover {
        background-color: #BCAEC7;
        color: #fff;
        border: 1px solid #BCAEC7;
    }
`;

export default Appointment;
