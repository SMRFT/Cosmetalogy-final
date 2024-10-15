import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoCall } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import maleIcon from './images/male-gender.png';
import femaleIcon from './images/femenine.png';
import transgenderIcon from './images/transgender.png';
import './BookedAppointments.css';

function BookedAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();

    const cardsPerPage = 8; // Adjust this number based on how many cards you want to display per page (2 rows of 4 cards each)

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        filterAppointmentsByDate(selectedDate);
    }, [selectedDate, appointments]);

    const fetchAppointments = () => {
        axios.get('http://127.0.0.1:8000/AppointmentView/')
            .then(response => {
                setAppointments(response.data);
                filterAppointmentsByDate(selectedDate, response.data);
            })
            .catch(error => {
                console.error('Error fetching appointments:', error);
            });
    };

    const filterAppointmentsByDate = (date, appointmentsList = appointments) => {
        const filtered = appointmentsList.filter(appointment => appointment.appointmentDate === date);
        setFilteredAppointments(filtered);
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const getGenderIcon = (gender) => {
        switch (gender.toLowerCase()) {
            case 'male':
                return maleIcon;
            case 'female':
                return femaleIcon;
            default:
                return transgenderIcon;
        }
    };

    const generateTimeSlots = () => {
        let startTime = new Date(`${selectedDate}T10:00:00`);
        const endTime = new Date(`${selectedDate}T20:00:00`);
        const timeSlots = [];

        while (startTime < endTime) {
            const endTimeSlot = new Date(startTime.getTime() + 30 * 60000);
            const timeSlot = {
                start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                end: endTimeSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            timeSlots.push(timeSlot);
            startTime = endTimeSlot;
        }

        return timeSlots;
    };

    const timeSlots = generateTimeSlots();

    const handleViewDetailsClick = (appointment) => {
        navigate('/Doctor/prescription', { state: { appointment, appointmentDate: appointment.appointmentDate, patientUID: appointment.patientUID ,
            patientName:appointment.patientName,mobileNumber:appointment.mobileNumber} });
    };

    const nextPage = () => {
        if ((currentPage + 1) * cardsPerPage < timeSlots.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const currentSlots = timeSlots.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage);

    return (
        <StyledContainer className="appointments-container">
            <h3 className="text-center mb-4">Booked Appointments</h3>
            <div className="date-picker-wrapper">
                <input type="date" value={selectedDate} onChange={handleDateChange} className="date-picker" />
            </div>
            <Pagination>
                <PaginationButton onClick={prevPage} disabled={currentPage === 0}>Previous</PaginationButton>
                <PaginationButton onClick={nextPage} disabled={(currentPage + 1) * cardsPerPage >= timeSlots.length}>Next</PaginationButton>
            </Pagination>
            <div className="appointments-list">
                {currentSlots.map((timeSlot, index) => {
                    const { start, end } = timeSlot;
                    const appointmentsInSlot = filteredAppointments.filter(appointment =>
                        appointment.appointmentTime >= start && appointment.appointmentTime < end
                    );
                    const hasAppointments = appointmentsInSlot.length > 0;

                    return (
                        <FlipCard key={index} className={hasAppointments ? 'flip-card' : 'flip-card no-appointment'} hasAppointments={hasAppointments}>
                            <div className="flip-card-inner">
                                <div className={`flip-card-front ${hasAppointments ? 'time-slot-background' : 'no-appointment-background'}`}>
                                    <TopSection>
                                        <p className='time'>{`${start} - ${end}`}</p>
                                    </TopSection>
                                    {hasAppointments ? (
                                        <BottomSection>
                                            <h2 className='mt-2'>{appointmentsInSlot[0].patientName}</h2>
                                            <MobileAndGenderContainer>
                                                <p><IoCall className="mobile-icon" />{appointmentsInSlot[0].mobileNumber}</p>
                                                <GenderIcon src={getGenderIcon(appointmentsInSlot[0].gender)} alt={appointmentsInSlot[0].gender} />
                                            </MobileAndGenderContainer>
                                            <p>Purpose of Visit: {appointmentsInSlot[0].purposeOfVisit}</p>
                                        </BottomSection>
                                    ) : (
                                        <BottomSection>
                                            <p className='mt-2'>No appointment</p>
                                        </BottomSection>
                                    )}
                                </div>
                                {hasAppointments && (
                                    <div className="flip-card-back">
                                        <AppointmentDetails>
                                            <h4 style={{fontSize:"1.3rem"}}>Appointment Details</h4>
                                            {hasAppointments && (
                                                <center><Button className='mt-4' onClick={() => handleViewDetailsClick(appointmentsInSlot[0])}>View Details</Button></center>
                                            )}
                                        </AppointmentDetails>
                                    </div>
                                )}
                            </div>
                        </FlipCard>
                    );
                })}
            </div>
        </StyledContainer>
    );
}

const StyledContainer = styled.div`
    margin-top: 65px;
`;

const TopSection = styled.div`
    background-color: #865CAF;
    color: white;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
`;

const BottomSection = styled.div`
    padding: 5px;
    width: 100%;
    box-sizing: border-box;
`;

const GenderIcon = styled.img`
    width: 24px;
    height: 24px;
    margin-bottom: 8px;
`;

const MobileAndGenderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
`;

const AppointmentDetails = styled.div`
    padding: 20px;
    text-align: center;
`;

const Button = styled.div`
    padding: 10px;
    background-color: white;
    color: #000;
    border-radius: 5px;
    font-size: 12px;
    cursor: pointer;
    width: 50%;
    text-align: center;
`;

const FlipCard = styled.div`
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: background-color 0.3s ease;
    width: 100%;
    perspective: 1000px;
    ${(props) => !props.hasAppointments && `
        pointer-events: none;
        opacity: 0.5;
        transition: opacity 0.3s ease;
    `}
`;

const Pagination = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    gap: 20px;
`;

const PaginationButton = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    @media (max-width: 768px) {
        padding: 8px 16px;
        font-size: 14px;
    }

    @media (max-width: 480px) {
        padding: 6px 12px;
        font-size: 12px;
    }
`;

export default BookedAppointments;
