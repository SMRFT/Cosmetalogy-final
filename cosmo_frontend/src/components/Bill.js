import React, { useState, useEffect,forwardRef  } from 'react';
import styled from 'styled-components';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { IoMdArrowRoundBack } from "react-icons/io";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PDFMain from './images/PDF_Main.jpeg';
const StyledContainer = styled.div`
  padding: 10px;
  max-width: 90%;
  margin: 20px auto;
  border-collapse: collapse;
`;
const Container = styled.div`
  margin-top: 65px;
`;

const Patientcardcontainer = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 500px;
  height: auto;
  padding: 10px;
  
`;

const PatientCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color:#BCAEC7;;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  font-family: serif;
  flex-grow: 1;
  flex-shrink: 1;
  width: 50%;
  text-align: center;
  cursor: pointer;

  .patient-name {
    font-size: 18px;
    font-weight: bold;
  }

  .patient-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .patient-contact {
    font-size: 14px;
  }
`;


const DatePickerWrapper = styled.div`
  display: flex;
  align-items: center; /* Ensures vertical alignment */
  
  .react-datepicker-wrapper {
    width: 100%;
  }

  .custom-date-input {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 0.25rem;
    padding: 0.375rem 0.75rem;
    width: 200px;
    background-color: #fff;
    cursor: pointer;
    margin-right: 10px; /* Adds space between the datepicker and the date displayed */
  }

  .calendar-icon {
    margin-right: 8px; /* Adds space between the icon and the date text */
    color: #C85C8E;
  }
`;

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-family: serif;
  max-width: 90%; /* Optional: Adjust based on your design */
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #ad97b4;
`;

const InfoText = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const DoctorInfo = styled.div`
  flex: 1;
  text-align: right;
`;

const DiscountContainer = styled.div`
  display: flex;
  align-items: center;
`;

const DiscountLabel = styled.label`
  margin-right: 10px;
  font-size: 16px;
`;

const DiscountInput = styled.input`
  padding: 5px;
  font-size: 16px;
  margin-right: 10px;
`;
const PaymentTypeContainer = styled.div`
  display: flex;
  align-items: center;
`;

const PaymentTypeLabel = styled.label`
  margin-right: 10px;
  font-size: 16px;
`;

const PaymentTypeInput = styled.select`
  padding: 5px;
  font-size: 16px;
  margin-right: 10px;
`;

const NetContainer = styled.div`
  display: flex;
  align-items: center;
`;

const NetLabel = styled.label`
  margin-right: 10px;
  font-size: 16px;
`;

const NetInput = styled.input`
  padding: 5px;
  font-size: 16px;
  margin-right: 10px;
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px; /* Add margin if needed */
`;

const NoDataMessage = styled.div`
  text-align: center;
  font-size: 18px;
  color: #888;
  padding: 20px;
`;

const Bill = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [patientData, setPatientData] = useState([]);
  const [billingData, setBillingData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicineDetails, setMedicineDetails] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPrescriptions, setSelectedPrescriptions] = useState({});
  const [isBillingDisplayed, setIsBillingDisplayed] = useState(false);
  const [quantity, setQuantity] = useState({});
  const [discount, setDiscount] = useState(0); // Initial discount percentage
  const [netAmount, setNetAmount] = useState('');
  const [hasData, setHasData] = useState(true);
  const [paymentType, setPaymentType] = useState('Card'); // Default to 'Card'
  const [section, setSection] = useState('Pharmacy');     // Default section to Pharmacy

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value); // Capture the selected payment type
  };

  useEffect(() => {
    fetchPatientData(startDate);
    fetchBillingData(startDate);
  }, [startDate]);

  useEffect(() => {
    if (selectedPatient) {
      calculateNetAmount();
    }
  }, [billingData, quantity, selectedPrescriptions, medicineDetails]);

  const fetchPatientData = async (date) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/summary/post/patient_details/?appointmentDate=${format(date, 'yyyy-MM-dd')}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPatientData(data);
      setHasData(data.length > 0);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };
  const fetchBillingData = async (date) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/summary/post/?appointmentDate=${format(date, 'yyyy-MM-dd')}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBillingData(data);
      setHasData(data.length > 0);

    } catch (error) {
      console.error('Error fetching billing data:', error);
    }
  };

  const fetchMedicineDetails = async (medicine_name) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/medicine_name/data/?medicine_name=${encodeURIComponent(medicine_name)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      return null;
    }
  };

  const handleDateChange = (date) => {
    setStartDate(date);
    fetchPatientData(date);
    fetchBillingData(date);
  };

  const extractPrescriptionDetails = (prescription) => {
    const prescriptions = prescription.split('Precription:').filter(Boolean).map(item => item.trim());
    return prescriptions.map(prescriptionItem => {
      const index = prescriptionItem.indexOf('Dosage');
      const totalDosageIndex = prescriptionItem.indexOf('Total Dosage:');
      let totalDosage = '';
  
      if (totalDosageIndex !== -1) {
        const totalDosageSubstring = prescriptionItem.substring(totalDosageIndex + 'Total Dosage:'.length).trim();
        totalDosage = totalDosageSubstring.split(' ')[0];
      }
  
      let particulars = index !== -1 ? prescriptionItem.substring(0, index).trim() : prescriptionItem;
  
      // Remove "Precription:" prefix if present
      if (particulars.startsWith('Precription:')) {
        particulars = particulars.substring('Precription:'.length).trim();
      }
  
      if (particulars.endsWith('-')) {
        particulars = particulars.slice(0, -1).trim();
      }
  
      return {
        particulars,
        totalDosage,
      };
    });
  };

  const handlePatientCardClick = (patient) => {
    setSelectedPatient(patient);
    setIsBillingDisplayed(true);
    calculateNetAmount(); // Recalculate net amount when a patient is selected
  };

  const handleBackClick = () => {
    setSelectedPatient(null); // Deselect the patient
    setIsBillingDisplayed(false); // Reset the billing display status so the date picker reappears
  };

  useEffect(() => {
    const fetchMedicineDetailsForPrescriptions = async () => {
      const details = {};
      for (const item of billingData) {
        const prescriptions = extractPrescriptionDetails(item.prescription);
        for (const prescription of prescriptions) {
          const { particulars } = prescription;
          if (!details[particulars]) {
            details[particulars] = await fetchMedicineDetails(particulars);
          }
        }
      }
      setMedicineDetails(details);
    };

    if (billingData.length > 0) {
      fetchMedicineDetailsForPrescriptions();
    }
  }, [billingData]);

  const handleQuantityChange = (itemIndex, prescriptionIndex, value) => {
    setQuantity((prevState) => ({
      ...prevState,
      [`${itemIndex}-${prescriptionIndex}`]: value,
    }));
    calculateNetAmount(); // Recalculate net amount whenever quantity changes
  };

  const calculateTotal = (price, qty) => {
    qty = parseFloat(qty);

    if (isNaN(parseFloat(price)) || price === 'Loading...' || price === 'N/A') {
      console.error('Invalid price:', price);
      return 'N/A';
    }

    const total = (parseFloat(price) * qty).toFixed(2);

    return total;
  };

   // Function to handle discount change
   const handleDiscountChange = (e) => {
    const discountValue = parseFloat(e.target.value);
    setDiscount(discountValue);
  };

  const calculateNetAmount = () => {
    if (!selectedPatient) {
      console.error('No patient selected');
      return;
    }
  
    let total = 0;
  
    // Filter billing data for the selected patient
    const patientBillingData = billingData.filter((item) => item.patientUID === selectedPatient.patientUID);
  
    patientBillingData.forEach((item, itemIndex) => {
      const prescriptions = extractPrescriptionDetails(item.prescription);
  
      prescriptions.forEach((prescription, prescriptionIndex) => {
        const key = `${itemIndex}-${prescriptionIndex}`;
        // Check if the prescription is selected
        if (selectedPrescriptions[key]) {
          const { particulars } = prescription;
          const qty = quantity[key] !== undefined ? quantity[key] : prescription.totalDosage;
          const medicineDetail = medicineDetails[particulars] || {};
          const { price } = medicineDetail || {};
  
          // Calculate total for the selected medicine
          const totalForMedicine = calculateTotal(price, qty);
          total += parseFloat(totalForMedicine) || 0;
        }
      });
    });
  
    // Apply discount to the total amount
    applyDiscount(total);
    setNetAmount(total.toFixed(2));
  };
  
// Function to update stock based on selected prescriptions
const updateStock = async () => {
  const stockUpdates = billingData
    .filter((item) => item.patientUID === selectedPatient.patientUID)
    .flatMap((item, itemIndex) => {
      const prescriptions = extractPrescriptionDetails(item.prescription);
      return prescriptions.map((prescription, prescriptionIndex) => {
        // Check if the prescription is selected
        if (!selectedPrescriptions[`${itemIndex}-${prescriptionIndex}`]) return null;

        const { particulars } = prescription;
        const qty = quantity[`${itemIndex}-${prescriptionIndex}`] !== undefined
          ? quantity[`${itemIndex}-${prescriptionIndex}`]
          : prescription.totalDosage;

        return { medicine_name: particulars, qty };
      }).filter(Boolean); // Filter out null values
    });

  let allStockUpdated = true; // Flag to check if all stock updates were successful

  // Send update requests for each selected prescription
  for (const stockUpdate of stockUpdates) {
    try {
      const response = await fetch('http://127.0.0.1:8000/update_stock/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockUpdate),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      const data = await response.json();
      console.log('Stock updated:', data);
      setSuccessMessage('Stock updated successfully!');

      // Automatically clear the success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error updating stock:', error);
      setSuccessMessage('');
      setErrorMessage('Insufficient stock.');
      allStockUpdated = false; // Mark the flag as false if there's an error
      break; // Stop further updates if one fails
    }
  }

  return allStockUpdated; // Return whether all updates were successful
};

const applyDiscount = () => {
  if (netAmount !== '') {
    const currentNetAmount = parseFloat(netAmount);
    const discountAmount = (currentNetAmount * discount) / 100;
    const newNetAmount = currentNetAmount - discountAmount;
    setNetAmount(newNetAmount.toFixed(2)); // Updating NetAmount with the new value
  }
};
const handleSaveData = async () => {
  let hasInvalidQuantity = false;
  let errorMessages = [];

  const table_data = billingData
    .filter((item) => item.patientUID === selectedPatient.patientUID)
    .flatMap((item, itemIndex) => {
      const prescriptions = extractPrescriptionDetails(item.prescription);

      // Filter out prescriptions with qty <= 0 or empty and check if they are selected
      const validPrescriptions = prescriptions.filter((prescription, prescriptionIndex) => {
        const qty = quantity[`${itemIndex}-${prescriptionIndex}`] !== undefined ? quantity[`${itemIndex}-${prescriptionIndex}`] : prescription.totalDosage;
        const medicineName = prescription.particulars;

        // Only process if the prescription is selected
        if (!selectedPrescriptions[`${itemIndex}-${prescriptionIndex}`]) return false;

        if (qty === '') {
          errorMessages.push(`The quantity for medicine "${medicineName}" is empty.`);
          return false;
        }

        if (qty <= 0) {
          errorMessages.push(`The quantity for medicine "${medicineName}" must be greater than zero.`);
          return false;
        }
        
        return true;
      });

      return validPrescriptions.map((prescription, prescriptionIndex) => {
        const { particulars } = prescription;
        const qty = quantity[`${itemIndex}-${prescriptionIndex}`] !== undefined ? quantity[`${itemIndex}-${prescriptionIndex}`] : prescription.totalDosage;
        const medicineDetail = medicineDetails[particulars] || {};
        const { price, CGST_percentage, CGST_value, SGST_percentage, SGST_value, batch_number } = medicineDetail || {};
        return {
          particulars,
          qty,
          price: price || 'N/A',
          CGST_percentage: CGST_percentage || 'N/A',
          CGST_value: CGST_value || 'N/A',
          SGST_percentage: SGST_percentage || 'N/A',
          SGST_value: SGST_value || 'N/A',
          batch_number: batch_number || 'N/A',
          total: calculateTotal(price, qty),
        };
      });
    });

  // If there are any error messages, display them and stop further execution
  if (errorMessages.length > 0) {
    setErrorMessage(errorMessages.join(' '));
    return;
  }

  // Calculate the net amount before applying the discount
  let calculatedNetAmount = 0;
  table_data.forEach((item) => {
    calculatedNetAmount += parseFloat(item.total) || 0;
  });

  // Apply discount after calculating the net amount
  const discountAmount = (calculatedNetAmount * discount) / 100;
  const discountedNetAmount = calculatedNetAmount - discountAmount;
  
  // Set the net amount to the discounted value
  setNetAmount(discountedNetAmount.toFixed(2));

  const dataToSubmit = {
    patientName: selectedPatient.patientName,
    patientUID: selectedPatient.patientUID,
    appointmentDate: format(startDate, 'yyyy-MM-dd'),
    table_data: table_data,
    paymentType, // Include the selected payment type
    section,     // Include the selected section
    netAmount: discountedNetAmount.toFixed(2),  // Store the discounted net amount
    discount: `${discount}%`, // Append '%' symbol when saving
  };
 
  try {
    const response = await fetch('http://127.0.0.1:8000/save/billing/data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSubmit),
    });

    if (!response.ok) {
      throw new Error('Failed to submit data');
    }

    const data = await response.json();
    console.log('Submitted data:', data);
    setSuccessMessage(`Billing was generated successfully for ${selectedPatient.patientName}`);

    setErrorMessage('');

    // Update stock only if billing is successful
    const stockUpdated = await updateStock();
    if (!stockUpdated) {
      // Handle case where stock update fails
      setErrorMessage('Stock update failed.');
    }
  } catch (error) {
    console.error('Error submitting data:', error);
    setSuccessMessage('');
    setErrorMessage('Error submitting data.');
  }
};

const convertToBase64 = (url, callback) => {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL('image/png');
    callback(dataURL);
  };
  img.onerror = error => console.error('Error converting image to Base64:', error);
};
const handleDownload = () => {
  if (!selectedPatient || !billingData.length) {
    console.error('No patient selected or billing data is empty');
    return;
  }
  const patientBillingData = billingData.filter(item => item.patientUID === selectedPatient.patientUID);
  const procedureTable = patientBillingData.flatMap((item, itemIndex) => {
    const prescriptions = extractPrescriptionDetails(item.prescription);
    return prescriptions.map((prescription, prescriptionIndex) => {
      const key = `${itemIndex}-${prescriptionIndex}`;
      if (!selectedPrescriptions[key]) return null;
      const qty = quantity[key] !== undefined ? quantity[key] : prescription.totalDosage;
      const medicineDetail = medicineDetails[prescription.particulars] || {};
      const { price, CGST_percentage, CGST_value, SGST_percentage, SGST_value, batch_number } = medicineDetail;
      return [
        prescription.particulars || 'N/A',
        qty || 'N/A',
        price || 'N/A',
        CGST_percentage || 'N/A',
        CGST_value || 'N/A',
        SGST_percentage || 'N/A',
        SGST_value || 'N/A',
        batch_number || 'N/A',
        calculateTotal(price, qty) || 'N/A',
      ];
    }).filter(Boolean);
  });
  if (procedureTable.length === 0) {
    alert('Please select a prescription to download the bill.');
    return;
  }
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const headerFooterHeight = 35;
  convertToBase64(PDFMain, mainImage => {
    doc.addImage(mainImage, 'PNG', 0, 0, pageWidth, pageHeight);
    let startY = headerFooterHeight + 50; // Increased startY to move the content further down
    // Title removed (Pharmacy Bill)
    // startY += 15;
    // Skip the patient info section entirely
    doc.text(` ${selectedPatient.patientName}`, 16, startY);
    startY += 35;
    // Green-colored Table
    doc.autoTable({
      head: [['Particulars', 'Qty', 'Price', 'CGST (%)', 'CGST Value', 'SGST (%)', 'SGST Value', 'Batch No.', 'Total']],
      body: procedureTable,
      startY: startY + 5, // Moving table further down by adding 20 to startY
      styles: { fillColor: [116, 180, 155] }, // Table color in RGB
    });
    const yOffset = doc.lastAutoTable.finalY + 10;
    // Adding dynamic net amount in place of Grand Total
    doc.setFontSize(12);
    doc.setTextColor(0, 150, 0); // Set text color to green for totals
    doc.text(`Net Amount: ${netAmount || 'N/A'}`, 14, yOffset + 15); // Grand total position is now net amount
    doc.save(`${selectedPatient.patientName}_Bill.pdf`);
  });
};

  return (
    <Container>
      <h3 className="text-center mb-4">Billing</h3>
      {selectedPatient && (
        <button style={{marginLeft:"80px"}} onClick={handleBackClick}>
          <IoMdArrowRoundBack />
        </button>
      )}
      
      {!isBillingDisplayed && (
        <center>
          <DatePickerWrapper>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              customInput={<CustomInput />}
            />
          </DatePickerWrapper>
          </center>
      )}

      <center>
        {!selectedPatient && (
          <Patientcardcontainer className="mt-4">
            <ul>
              {patientData.map((patient, index) => (
                <PatientCard key={index} onClick={() => handlePatientCardClick(patient)}>
                  <div className="patient-details">
                    <div className="patient-name">{patient.patientName}</div>
                    <div className="patient-contact">{patient.mobileNumber}</div>
                  </div>
                </PatientCard>
              ))}
            </ul>
            {!hasData && (
              <NoDataMessage>No data available for the selected date</NoDataMessage>
            )}
          </Patientcardcontainer>
        )}
      </center>

      <div>
        {selectedPatient ? (
          <InfoContainer className="mt-2">
            <InfoText>
              <PatientInfo>
                <div>
                  <strong>Name:</strong> {selectedPatient.patientName}
                </div>
                <div>
                  <strong>PatientUID:</strong> {selectedPatient.patientUID}
                </div>
              </PatientInfo>
              <DoctorInfo>
                <div>
                  <strong>Doctor Name:</strong> Dr. S. Vijay Kannan M.ch (Plastic)
                </div>
              </DoctorInfo>
            </InfoText>
          </InfoContainer>
        ) : null}
      </div>
      
      <StyledContainer>
        {selectedPatient && (
          <table bordered hover responsive>
            <thead>
              <tr>
                <th>Select</th>
                <th>Particulars</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>CGST %</th>
                <th>CGST Value</th>
                <th>SGST %</th>
                <th>SGST Value</th>
                <th>Batch Number</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {billingData
                .filter((item) => item.patientUID === selectedPatient.patientUID)
                .map((item, itemIndex) => {
                  const prescriptions = extractPrescriptionDetails(item.prescription);
                  return prescriptions.map((prescription, prescriptionIndex) => {
                    const { particulars } = prescription;
                    const qty = quantity[`${itemIndex}-${prescriptionIndex}`] !== undefined ? quantity[`${itemIndex}-${prescriptionIndex}`] : prescription.totalDosage;
                    const medicineDetail = medicineDetails[particulars] || {};
                    const { price, CGST_percentage, CGST_value, SGST_percentage, SGST_value, batch_number } = medicineDetail || {};

                    return (
                      <tr key={`${itemIndex}-${prescriptionIndex}`}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedPrescriptions[`${itemIndex}-${prescriptionIndex}`] || false}
                            onChange={(e) => setSelectedPrescriptions((prevState) => ({
                              ...prevState,
                              [`${itemIndex}-${prescriptionIndex}`]: e.target.checked,
                            }))}
                          />
                        </td>
                        <td>{particulars}</td>
                        <td>
                          <input
                            type="text"
                            value={qty}
                            onChange={(e) => handleQuantityChange(itemIndex, prescriptionIndex, e.target.value)}
                          />
                        </td>
                        <td>{price || 'Loading...'}</td>
                        <td>{CGST_percentage || 'N/A'}</td>
                        <td>{CGST_value || 'N/A'}</td>
                        <td>{SGST_percentage || 'N/A'}</td>
                        <td>{SGST_value || 'N/A'}</td>
                        <td>{batch_number || 'N/A'}</td>
                        <td>{calculateTotal(price, qty)}</td>
                      </tr>
                    );
                  });
                })}
            </tbody>
          </table> 
        )}

      {selectedPatient && (
      <FlexRow>
      <DiscountContainer>
        <DiscountLabel htmlFor="discount">Discount % : </DiscountLabel>
        <DiscountInput
          type="text"
          id="discount"
          value={discount}
          placeholder="Discount %"
          onChange={(e) => setDiscount(e.target.value)}
        />
        <button onClick={applyDiscount}>Apply</button>
      </DiscountContainer>

      <PaymentTypeContainer>
        <PaymentTypeLabel>Payment Type : </PaymentTypeLabel>
        <PaymentTypeInput value={paymentType} onChange={handlePaymentTypeChange}>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
        </PaymentTypeInput>
      </PaymentTypeContainer>

      <NetContainer>
        <NetLabel htmlFor="Net">Net Amount:</NetLabel>
        <NetInput
          type="text"
          id="Net"
          value={netAmount}
          onChange={(e) => setNetAmount(e.target.value)}
        />
      </NetContainer>
      </FlexRow>
      )}
      </StyledContainer>
          <br/>
      
      {selectedPatient && (
        <center>
              <div className="d-flex flex-column align-items-center">
              <Row className="g-3">
              <Col xs="auto">
          <button onClick={handleSaveData}>
            Generate
          </button>
          </Col>
          <Col xs="auto">
           <button  onClick={handleDownload}>
             Download
           </button>
               </Col>
               </Row>
          {successMessage && <div style={{ marginTop: '10px', color: 'green' }}>{successMessage}</div>}
          {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
          </div >
        </center>
        
      )}
    </Container>

  );
};

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" onClick={onClick} ref={ref}>
    <FaCalendarAlt className="calendar-icon" />
    <span>{value || 'Select a date'}</span> {/* Wrapped text in a span for potential additional styling */}
  </div>
));

export default Bill;