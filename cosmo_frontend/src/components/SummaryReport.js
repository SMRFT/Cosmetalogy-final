import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfMonth, format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek, faCalendarAlt, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FaDownload, FaTrash } from "react-icons/fa";
import './DatePicker.css';

const SummaryReport = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(selectedInterval);
  }, [selectedInterval, selectedDate]);

  const getReportHeading = (interval) => {
    switch (interval) {
      case 'day':
        return 'Daily Report';
      case 'month':
        return 'Monthly Report';
      default:
        return 'Billing Report';
    }
  };

  const fetchData = async (interval) => {
    let dateParam = '';
    if (interval === 'day') {
      dateParam = format(selectedDate, 'yyyy-MM-dd');
    } else if (interval === 'month') {
      const startOfMonthDate = startOfMonth(selectedDate);
      dateParam = format(startOfMonthDate, 'yyyy-MM-dd');
    }

    try {
      const response = await axios.get(`http://127.0.0.1:8000/summary/${interval}/?appointmentDate=${dateParam}`);
      setSummaryData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleIntervalChange = (interval) => {
    setSelectedInterval(interval);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const downloadCSV = () => {
    if (!summaryData || summaryData.length === 0) return;

    const headers = [
      'Patient Name',
      'Date',
      'Diagnosis',
      'Complaints',
      'Findings',
      'Prescription',
      'Plans',
      'Tests',
      'Procedure'
    ];

    const rows = summaryData.map(item => [
      item.patientName,
      item.appointmentDate,
      item.diagnosis,
      item.complaints,
      item.findings,
      item.prescription,
      item.plans,
      item.tests,
      item.procedures
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'summary_report.csv');
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };

  const renderComplaints = (complaintsStr) => {
    try {
      // Log the incoming complaints data for debugging
      console.log('Complaints Data:', complaintsStr);
      
      // If the complaintsStr is not an object, try parsing
      const complaints = typeof complaintsStr === 'string' ? JSON.parse(complaintsStr) : complaintsStr;
      
      if (Array.isArray(complaints)) {
        return complaints.map((complaint, index) => (
          <div key={index}>
            <p>Complaint: {complaint.complaints}</p>
            <p>Duration: {complaint.duration} {complaint.durationUnit}</p>
          </div>
        ));
      } else {
        return <p>No valid complaints available</p>;
      }
    } catch (error) {
      console.error('Error parsing complaints:', error);
      return <p>Invalid complaints data</p>;
    }
  };
  

  return (
    <Container>
      <Header>
        <h3 className='text-center mb-2'>Summary Report</h3>
        <button title='Download Excel' onClick={downloadCSV}>
          <FaDownload />
        </button>
      </Header>
      <IntervalSelector>
        <ButtonGroup>
          <IntervalButton
            title='Daily Report'
            onClick={() => handleIntervalChange('day')}
            className={selectedInterval === 'day' ? 'active' : ''}
            active={selectedInterval === 'day'}
          >
            <FontAwesomeIcon icon={faCalendarDay} />
          </IntervalButton>
          <IntervalButton
            title='Monthly Report'
            onClick={() => handleIntervalChange('month')}
            className={selectedInterval === 'month' ? 'active' : ''}
            active={selectedInterval === 'month'}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
          </IntervalButton>
        </ButtonGroup>
        <DatePickerWrapper>
          {selectedInterval === 'day' && (
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              showPopperArrow={false}
              customInput={<CustomDateInput />}
            />
          )}
          {selectedInterval === 'month' && (
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM"
              showMonthYearPicker
              showPopperArrow={false}
              customInput={<CustomDateInput />}
            />
          )}
        </DatePickerWrapper>
      </IntervalSelector>
      <br/>
      <Content>
        {summaryData && summaryData.length > 0 ? (
          <Summary>
            <h5 className='text-center'>{getReportHeading(selectedInterval)}</h5>
            <table>
              <MDBTableHead align='middle'>
                <tr>
                  <th>Patient Name</th>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th>Complaints</th>
                  <th>Findings</th>
                  <th>Prescription</th>
                  <th>Plans</th>
                  <th>Tests</th>
                  <th>Procedure</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {summaryData.map((item) => (
                  <StyledRow key={item.id}>
                    <td>{item.patientName}</td>
                    <td style={{whiteSpace:"nowrap"}}>{item.appointmentDate}</td>
                    <td>{item.diagnosis}</td>
                    <td>{renderComplaints(item.complaints)}</td>
                    <td>{item.findings}</td>
                    <td>{item.prescription}</td>
                    <td>{item.plans}</td>
                    <td>{item.tests}</td>
                    <td>{item.proceduresList}</td>
                  </StyledRow>
                ))}
              </MDBTableBody>
            </table>
          </Summary>
        ) : (
          <Message>No data available for the selected interval and date.</Message>
        )}
      </Content>
    </Container>
  );
};

export default SummaryReport;


const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin-top: 65px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; /* Ensure the icon is within its container */
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const IntervalSelector = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;  /* Center horizontally */
  margin-top: -30px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  font-weight: bold;
`;

const IntervalButton = styled.button`
  padding: 5px 10px;
  border: none;
  background-color: ${({ active }) => (active ? '#C85C8E' : 'white')};
  color: ${({ active }) => (active ? 'white' : '#C85C8E')};
  font-size: 1.5rem;
  cursor: pointer;
`;

const DatePickerWrapper = styled.div`
  color: #C85C8E;
`;

const Summary = styled.div`
  flex: 1;
  overflow-x: auto;
`;

const StyledRow = styled.tr`
  &:nth-child(even) {
    background-color: #ffffff;
  }
`;

const Message = styled.div`
  text-align: center;
  font-size: 1.2rem;
`;

const CustomDateInput = styled.input`
  border: none;
  padding: 8px;
  color: #C85C8E;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  background-color: white;
  font-weight: bold;
  text-align: center;
`;
