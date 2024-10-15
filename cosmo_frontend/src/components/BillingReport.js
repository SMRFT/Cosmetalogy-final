import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfWeek, startOfMonth, addWeeks, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { HiClipboardDocumentList } from "react-icons/hi2";
import { FaDownload, FaTrash } from "react-icons/fa";

// Utility function to format texta
const formatText = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const BillingReport = () => {
  const [billingData, setBillingData] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [medicineOptions, setMedicineOptions] = useState([]);
  const navigate = useNavigate();

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
      const response = await axios.get(`http://127.0.0.1:8000/billing/${interval}/?appointmentDate=${dateParam}`);
      setBillingData(response.data.billing_data); // Adjust according to the backend response
      setMessage('');
      const initialEditableData = response.data.billing_data.reduce((acc, item) => {
          acc[item.patientUID] = item.table_data;
          return acc;
      }, {});
      setEditableData(initialEditableData);      
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

  const downloadCSV = () => {
    if (!billingData) return;
  
    const headers = ['Patient Name', 'Particulars', 'Quantity', 'Price', 'CGST_percentage', 'CGST_value', 'SGST_percentage', 'SGST_value',  'Total'];
    const rows = billingData.flatMap(item => 
      item.table_data.map((data, index) => [
        index === 0 ? item.patientName : '', // Only display the patient name once
        data.particulars, 
        data.qty, 
        data.price, 
        data.CGST_percentage, 
        data.CGST_value, 
        data.SGST_percentage, 
        data.SGST_value, 
        data.total
      ])
    );
  
    // Append the total row
    // Add this to include the total sum in the CSV export
   rows.push(['', '', '', '', '', '', '', 'Grand Total', grandTotal.toFixed(2)]);

  
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${getReportHeading(selectedInterval)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  const handleDelete = async (recordId) => {
    try {
        await axios.delete('http://127.0.0.1:8000/delete/billing/data/', {
            data: { record_id: recordId },  // Send the unique identifier
        });
        fetchData(selectedInterval); // Refresh data after deletion
        setMessage('Data deleted successfully');
    } catch (error) {
        console.error('Error deleting data:', error);
        setMessage('Error deleting data.');
    }
};
  

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
};

const handleDataChange = async (patientUID, index, field, value) => {
  let newEditableData = [...editableData[patientUID]];

  if (field === 'particulars') {
    const price = await fetchMedicinePrice(value);
    newEditableData[index] = { ...newEditableData[index], [field]: value, price: price, total: price * newEditableData[index].qty };
  } else if (field === 'qty') {
    const price = newEditableData[index].price;
    newEditableData[index] = { ...newEditableData[index], [field]: value, total: value * price };
  } else {
    newEditableData[index] = { ...newEditableData[index], [field]: value };
  }

  setEditableData(prevData => ({ ...prevData, [patientUID]: newEditableData }));
};


const fetchMedicineData = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/pharmacy/data/');
    setMedicineOptions(response.data); // Assuming response.data is an array of medicines
  } catch (error) {
    console.error('Error fetching medicine data:', error);
  }
};

useEffect(() => {
  fetchMedicineData();
  // other dependencies...
}, []);

// Function to fetch the price of the selected medicine
const fetchMedicinePrice = async (medicine_name) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/pharmacy/medicine/${medicine_name}/price/`);
    return response.data.price; // Assuming the response contains a price field
  } catch (error) {
    console.error('Error fetching medicine price:', error);
    return 0;
  }
};

// Function to update total based on quantity and price
const updateTotal = (patientUID, dataIndex, newQty, price) => {
  const newTotal = newQty * price;
  setEditableData(prevData => {
    const newData = [...prevData[patientUID]];
    newData[dataIndex] = { ...newData[dataIndex], qty: newQty, total: newTotal };
    return { ...prevData, [patientUID]: newData };
  });
};


const saveChanges = async (patientUID, appointmentDate) => {
  try {
      await axios.put('http://127.0.0.1:8000/update/billing/data/', {
          patientUID: patientUID,
          appointmentDate: appointmentDate,
          table_data: editableData[patientUID],
      });
      fetchData(selectedInterval); // Refresh data after saving changes
      setMessage('Data updated successfully');
      toggleEditMode(); // Exit edit mode
  } catch (error) {
      console.error('Error updating data:', error);
      setMessage('Error updating data.');
  }
};
// Safely calculate the grand total with null checks
const grandTotal = (billingData || []).reduce((sum, item) => {
  // Use empty array if item.table_data is null or undefined
  return sum + (item.table_data || []).reduce((innerSum, data) => {
    // Parse total and ensure it's a valid number
    return innerSum + parseFloat(data.total || 0);
  }, 0);
}, 0);


  return (
    <Container>
      <Header>
        <h3 className='text-center mb-2'>Billing Report</h3>
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
            <>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy-MM"
                showMonthYearPicker
                showPopperArrow={false}
                customInput={<CustomDateInput />}
              />
            </>
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
      <br/>
      <Content>
        {message && <Message>{message}</Message>}
        {billingData && billingData.length > 0 ? (
          <Billing>
            <h5 className='text-center'>{getReportHeading(selectedInterval)}</h5>
            <table align='middle'>
              <MDBTableHead align='middle'>
                <tr>
                  <th>Patient Name</th>
                  <th>Bill Number</th>
                  <th>Particulars</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>CGST_percentage</th>
                  <th>CGST_value</th>
                  <th>SGST_percentage</th>
                  <th>SGST_value</th>
                  <th>Total</th>
                  {/* <th>Edit & save</th>
                  <th>Remove</th> */}
                </tr>
              </MDBTableHead>
              <MDBTableBody>
        {billingData && billingData.length > 0 ? (
          billingData.map((item, index) => (
            <React.Fragment key={item.patientUID}>
              {item.table_data && item.table_data.length > 0 ? (
                item.table_data.map((data, dataIndex) => (
                  <tr key={`${item.patientUID}-${dataIndex}`}>
                    {dataIndex === 0 && (
                      <td rowSpan={item.table_data.length}>
                        {formatText(item.patientName)}
                      </td>
                    )}
                    <td>{data.billNumber}</td>
                    <td>{data.particulars}</td>
                    <td>{data.qty}</td>
                    <td>{data.price}</td>
                    <td>{data.CGST_percentage}</td>
                    <td>{data.CGST_value}</td>
                    <td>{data.SGST_percentage}</td>
                    <td>{data.SGST_value}</td>
                    <td>{parseFloat(data.total).toFixed(2)}</td> {/* Correct format */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No table data available
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))
        ) : (
          <tr>
            <td colSpan="8" className="text-center">
              No data available
            </td>
          </tr>
        )}
      </MDBTableBody>

          {/* Footer for Grand Total */}
          <tfoot>
            <tr>
              <td colSpan="8" className="text-right"><strong>Grand Total</strong></td>
              <td><strong>{grandTotal.toFixed(2)}</strong></td> {/* Display grand total */}
            </tr>
          </tfoot>
            </table>
          </Billing>
        ) : (
          <Message>No data available for the selected interval.</Message>
        )}
      </Content>
    </Container>
  );
};

export default BillingReport;

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
    background-color: #007bff;
    color: white;
  }
`;

const Billing = styled.div`
  flex: 1;
  overflow-x: auto;
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

