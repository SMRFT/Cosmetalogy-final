import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfWeek, startOfMonth, addWeeks, format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { FaDownload } from "react-icons/fa";

const BillingProcedureReport = () => {
    const [billingData, setBillingData] = useState(null);
    const [selectedInterval, setSelectedInterval] = useState('day');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('procedure'); // New state for active tab

    const getReportHeading = (interval) => {
        switch (interval) {
            case 'day':
                return 'Daily Report';
            case 'week':
                return 'Weekly Report';
            case 'month':
                return 'Monthly Report';
            default:
                return 'Billing Report';
        }
    };

    useEffect(() => {
        if (selectedInterval === 'week' && !selectedWeek) {
            setSelectedWeek(startOfWeek(selectedDate, { weekStartsOn: 1 }));
        }
        fetchData(selectedInterval);
    }, [selectedInterval, selectedDate, selectedWeek]);

    const fetchData = async (interval) => {
        let dateParam = '';
        if (interval === 'day') {
            dateParam = format(selectedDate, 'yyyy-MM-dd');
        } else if (interval === 'week' && selectedWeek) {
            dateParam = format(selectedWeek, 'yyyy-MM-dd');
        } else if (interval === 'month') {
            const startOfMonthDate = startOfMonth(selectedDate);
            dateParam = format(startOfMonthDate, 'yyyy-MM-dd');
        }

        try {
            const response = await axios.get(`http://127.0.0.1:8000/procedurebilling/${interval}/?appointmentDate=${dateParam}`);
            setBillingData(response.data);
            setMessage('');
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage('Error fetching data.');
        }
    };

    const handleIntervalChange = (interval) => {
        setSelectedInterval(interval);
        setSelectedWeek(null);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleWeekChange = (weekStart) => {
        setSelectedWeek(weekStart);
    };

    const getWeeksInMonth = (date) => {
        const startOfMonthDate = startOfMonth(date);
        const weeks = [];
        for (let i = 0; i < 5; i++) {
            const weekStart = addWeeks(startOfMonthDate, i);
            if (weekStart.getMonth() === date.getMonth()) {
                weeks.push(weekStart);
            }
        }
        return weeks;
    };

    const downloadProcedureCSV = () => {
        if (!billingData) return;

        const headers = ['Patient Name', 'Patient UID', 'Appointment Date', 'Procedure', 'Procedure Date', 'Price', 'GST', 'GST Rate', 'Total'];
        let totalSum = 0; // Variable to store the total sum
        const rows = billingData.flatMap(item => {
            const procedures = typeof item.procedures === 'string' ? JSON.parse(item.procedures) : item.procedures;
            return procedures.map(proc => {
                totalSum += parseFloat(proc.total || 0); // Add total to sum
                return [
                    item.patientName,
                    item.patientUID,
                    item.appointmentDate,
                    proc.procedure,
                    proc.procedureDate,
                    proc.price,
                    proc.gst,
                    proc.gstRate,
                    proc.total
                ];
            });
        });

        // Add the total sum row at the end
        rows.push(['', '', '', '', '', '', '', 'Grand Total', totalSum.toFixed(2)]);

        const csvContent = [
            headers.join(','), 
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Procedure_${getReportHeading(selectedInterval)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadConsumerCSV = () => {
        if (!billingData) return;

        const headers = ['Patient Name', 'Patient UID', 'Appointment Date', 'Item', 'Quantity', 'Total'];
        let totalSum = 0; // Variable to store the total sum
        const rows = billingData.flatMap(item => {
            const consumer = typeof item.consumer === 'string' ? JSON.parse(item.consumer) : item.consumer;
            return consumer.map(con => {
                totalSum += parseFloat(con.total || 0); // Add total to sum
                return [
                    item.patientName,
                    item.patientUID,
                    item.appointmentDate,
                    con.item,
                    con.qty,
                    con.total
                ];
            });
        });

        // Add the total sum row at the end
        rows.push(['', '', '', '', 'Grand Total', totalSum.toFixed(2)]);

        const csvContent = [
            headers.join(','), 
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Consumer_${getReportHeading(selectedInterval)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Container>
            <Header>
                <h3 className='text-center mb-2'>Billing Report</h3>
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
                        title='Weekly Report'
                        onClick={() => handleIntervalChange('week')}
                        className={selectedInterval === 'week' ? 'active' : ''}
                        active={selectedInterval === 'week'}
                    >
                        <FontAwesomeIcon icon={faCalendarWeek} />
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
                    {selectedInterval === 'week' && (
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM"
                            showMonthYearPicker
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

            {selectedInterval === 'week' && (
                <WeekButtons>
                    {getWeeksInMonth(selectedDate).map((weekStart, index) => (
                        <WeekButton
                            key={index}
                            onClick={() => handleWeekChange(weekStart)}
                            className={selectedWeek && format(selectedWeek, 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd') ? 'active' : ''}
                        >
                            {`${index + 1} Week`}
                        </WeekButton>
                    ))}
                </WeekButtons>
            )}
            <br />
            <Content>
                {message && <Message>{message}</Message>}
                <TabButtons>
                    <TabButton
                        active={activeTab === 'procedure'}
                        onClick={() => setActiveTab('procedure')}
                    >
                        Procedure Bill
                    </TabButton>
                    <TabButton
                        active={activeTab === 'consumer'}
                        onClick={() => setActiveTab('consumer')}
                    >
                        Consumable Bill
                    </TabButton>
                </TabButtons>
                {billingData && billingData.length > 0 ? (
                    <BillingContainer>
                        {activeTab === 'procedure' && (
                            <Billing>
                                <Header>
                                    <h5 className='text-center'>Procedure Bill - {getReportHeading(selectedInterval)}</h5>
                                    <button title='Download Procedure CSV' onClick={downloadProcedureCSV}>
                                        <FaDownload />
                                    </button>
                                </Header>
                                <table align='middle' className='mt-2'>
                                    <MDBTableHead align='middle'>
                                        <tr>
                                            <th>Patient Name</th>
                                            <th>Patient UID</th>
                                            <th>Appointment Date</th>
                                            <th>Procedure</th>
                                            <th>Procedure Date</th>
                                            <th>Price</th>
                                            <th>GST</th>
                                            <th>GST Rate</th>
                                            <th>Total</th>
                                        </tr>
                                    </MDBTableHead>
                                    <MDBTableBody>
                                        {billingData.map((item) => (
                                            <React.Fragment key={item.patientUID}>
                                                {item.procedures.map((proc, index) => (
                                                    <tr key={index}>
                                                        {index === 0 && (
                                                            <>
                                                                <td rowSpan={item.procedures.length}>{item.patientName}</td>
                                                                <td rowSpan={item.procedures.length}>{item.patientUID}</td>
                                                                <td rowSpan={item.procedures.length}>{item.appointmentDate}</td>
                                                            </>
                                                        )}
                                                        <td>{proc.procedure}</td>
                                                        <td>{proc.procedureDate}</td>
                                                        <td>{proc.price}</td>
                                                        <td>{proc.gst}</td>
                                                        <td>{proc.gstRate}</td>
                                                        <td>{proc.total}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </MDBTableBody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="8" className="text-right"><strong>Grand Total</strong></td>
                                            <td><strong>
                                                {billingData.reduce((sum, item) => {
                                                    return sum + item.procedures.reduce((procSum, proc) => procSum + parseFloat(proc.total || 0), 0);
                                                }, 0).toFixed(2)}
                                            </strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </Billing>
                        )}
                        {activeTab === 'consumer' && (
                            <Billing>
                                <Header>
                                    <h5 className='text-center'>Consumable Bill - {getReportHeading(selectedInterval)}</h5>
                                    <button title='Download Consumer CSV' onClick={downloadConsumerCSV}>
                                        <FaDownload />
                                    </button>
                                </Header>
                                <table align='middle' className='mt-2'>
                                    <MDBTableHead align='middle'>
                                        <tr>
                                            <th>Patient Name</th>
                                            <th>Patient UID</th>
                                            <th>Appointment Date</th>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </MDBTableHead>
                                    <MDBTableBody>
                                        {billingData.map((item) => (
                                            <React.Fragment key={item.patientUID}>
                                                {item.consumer.map((con, index) => (
                                                    <tr key={index}>
                                                        {index === 0 && (
                                                            <>
                                                                <td rowSpan={item.consumer.length}>{item.patientName}</td>
                                                                <td rowSpan={item.consumer.length}>{item.patientUID}</td>
                                                                <td rowSpan={item.consumer.length}>{item.appointmentDate}</td>
                                                            </>
                                                        )}
                                                        <td>{con.item}</td>
                                                        <td>{con.qty}</td>
                                                        <td>{con.total}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </MDBTableBody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="5" className="text-right"><strong>Grand Total</strong></td>
                                            <td><strong>
                                                {billingData.reduce((sum, item) => {
                                                    return sum + item.consumer.reduce((conSum, con) => conSum + parseFloat(con.total || 0), 0);
                                                }, 0).toFixed(2)}
                                            </strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </Billing>
                        )}
                    </BillingContainer>
                ) : (
                    <Message>No data available</Message>
                )}
            </Content>
        </Container>
    );
};

export default BillingProcedureReport;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin-top: 65px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
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
  justify-content: center;
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

const WeekButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const WeekButton = styled.button`
  margin: 5px;
  &.active {
    background-color: #C85C8E;
    color: white;
  }
`;

const Billing = styled.div`
  flex: 1;
  overflow-x: auto;
`;

const BillingContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;
`;

const Message = styled.div`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
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

const TabButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: ${({ active }) => (active ? '#C85C8E' : 'white')};
  color: ${({ active }) => (active ? 'white' : '#C85C8E')};
  font-size: 1rem;
  cursor: pointer;
  margin: 0 5px;
  border-radius: 5px;
  transition: background-color 0.3s, color 0.3s;
  
  &:hover {
    background-color: #C85C8E;
    color: white;
  }
`;
