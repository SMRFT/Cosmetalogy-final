import React, { useState,useEffect,useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Col, Row, Form, Tab, Nav, Modal} from 'react-bootstrap';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import male from './images/male.png';        
import female from './images/female.png';
import { BsPatchPlusFill} from "react-icons/bs";
import { BiImageAdd, BiTrash } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import axios from 'axios';
import { FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import MedicalHistory from './MedicalHistory';
import Diagnosis from './Diagnosis';
import Complaints from './Complaints';
import Findings from './Findings';
import Tests from './Tests';
import Procedures from './Procedure';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import PDFHeader from './images/PDF_Header.png';
import PDFFooter from './images/PDF_Footer.png';
import 'jspdf-autotable';

const darkGray = '#b3a591';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.bodyBackgroundColor};
`;

export const StyledContainer = styled.div`
  margin-top: 65px;
`;

export const SectionTitle = styled.h6`
  margin-top: 10px;
  text-align: center;
`;

export const PatientDetailsContainer = styled.div`
  flex-direction: column;
  align-items: center;
  background-color:  #b798c0;
  padding: 20px;
  width: 300px;
  height: 500px;
  position: absolute;
  left: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top:10px;
`;

export const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
`;

export const PatientName = styled.h5`
  margin: 0;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
  width: 100%;
`;

export const PatientText = styled.p`
  margin: 0;
  color: white;
  text-align: left;
  width: 100%;
`;

export const RightContent = styled.div`
  margin-left: 320px;
  padding: 5px;
`;

export const CenteredFormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const SummaryContainer = styled.div`
  padding: 10px;
  background-color: #b798c0; // Updated background color
  border-radius: 10px;
  width: 100%;
  height: auto;
  margin-left: auto;
  margin-right: auto;
`;

const SummaryDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 20px;
  padding: 20px;
  background-color: #ffffff; // Changed to white background
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0 auto;
`;
const SummaryTitle = styled.h3`
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
  color: #333; // Dark gray color
`;

const SummaryItemTitle = styled.h4`
  margin-top: 10px;
  margin-bottom: 10px;
  color: ${darkGray}; // Dark gray color
`;

const PatientDetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  line-height: 1.6;
`;

const PatientDetailsColumn = styled.div`
  flex: 1;
  &:first-child {
    margin-right: 20px;
  }
`;

const Divider = styled.hr`
  width: 100%;
  margin: 10px 0;
  border: 1px solid #ddd;
`;


const DateDisplay = styled.div`
  font-size: 16px;
  color: #333;
`;

const CalendarIcon = styled(FaCalendarAlt)`
  font-size: 24px;
  cursor: pointer;
  color: #C85C8E;
`;

export const ImageContainer = styled.section`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color: #b798c0; // Light brown background
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

export const UploadedImage = styled.img`
  width: 80px;
  height: 80px;
  margin: 5px;
  object-fit: cover;
`;
export const PdfContainer = styled.section`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color:  #b798c0; // Light blue background
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

export const PdfItem = styled.div`
  margin: 10px;
  padding: 10px;
  background-color: #ffffff; // White background for individual PDF items
  border: 1px solid #cccccc; // Light gray border
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const RemoveButton = styled.button`
  background-color: #ff6b6b; // Red background
  color: #ffffff; // White text
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #ee5253; // Darker red on hover
  }
`;
export const SectionTitle2 = styled.h4`
  margin-top: 20px;
  margin-bottom: 10px;
  color: ${darkGray}; // Dark gray color
`;

export const UploadIcon = styled.i`
  font-size: 3rem;
  color: #757575; // Gray color
`;

export const UploadText = styled.p`
  font-size: 1rem;
  color: #757575; // Gray color
`;

export const PrescriptionContainer = styled.section`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color: #b798c0; // Light brown background
  border-radius: 10px;
  text-align: center;

  .form-group {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  .form-check-inline {
    margin-right: 10px;
  }

  .form-control,
  .form-check {
    min-width: 50px; /* Adjust based on the minimum size needed */
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ContainerRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const NextVisitonContainer = styled.div`
  flex: 1;
  margin: 0 15px; // Adjusted margin for balanced spacing
  padding: 20px;
  background-color: #b798c0; // Light brown background
  border-radius: 10px;
  text-align: center;
`;

export const PlanContainer = styled.div`
flex: 1;
margin: 0 15px; // Adjusted margin for balanced spacing
padding: 20px;
background-color: #b798c0; // Light brown background
border-radius: 10px;
text-align: center;
`;

const MedicalHistoryButton = styled.div`
  position: absolute;
  top: 120px;
  right: 0;
  margin: 1rem;
`;

const PrescriptionDetails = () => { 
  const [selectedDiagnosis, setSelectedDiagnosis] = useState([]);
  const [selectedComplaints, setSelectedComplaints] = useState([]);
  const [selectedfindings, setSelectedFindings] = useState([]);
  const [selectedprocedure, setSelectedprocedure] = useState([]);
  const [prescriptionInputs, setPrescriptionInputs] = useState([
    { selectedPrescription: [], dosage: '', durationNumber: '', duration: '', m: false, a: false, e: false, n: false }
  ]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
   const [selectedDate, setSelectedDate] = useState(null);
   const [planDetails, setPlanDetails] = useState({
    plan1: '',
    plan2: '',
    plan3: ''
  });

  const handleSelectDiagnosis = (diagnosis) => setSelectedDiagnosis(diagnosis);
  const handleSelectComplaints = (complaints) => {setSelectedComplaints(complaints);};
  const handleSelectfindings = (findings) => setSelectedFindings(findings);
  const handleSelectprocedure = (procedure) => setSelectedprocedure(procedure);
  const handleSelectTests = (tests) => setSelectedTests(tests);
  const handleDateChange = (date) => setSelectedDate(date);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const handleModalOpen = () => setShowModal(true); // Open modal
  const handleModalClose = () => setShowModal(false); // Close modal

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date:', date);
      return 'Invalid Date';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const location = useLocation();
  const { appointment, patientUID,mobileNumber,patientName,appointmentDate } = location.state;

  console.log('Appointment:', appointment);
  console.log('Patient UID:', patientUID);
 const [medicineOptions, setMedicineOptions] = useState([]);
 const [vital, setVital] = useState([]);

    useEffect(() => {
         
      // Fetch medicine options from the API
      axios.get('http://127.0.0.1:8000/pharmacy/data/')
        .then(response => {
          const medicineNames = response.data.map(medicine => ({
            label: medicine.medicine_name
          }));
          setMedicineOptions(medicineNames);
        })
        .catch(error => {
          console.error('Error fetching medicine names:', error);
        });
    }, []);

    useEffect(() => {
      if (!patientUID) return; // Only fetch if patientUID is provided
  
      axios.get(`http://127.0.0.1:8000/vitalform/?patientUID=${patientUID}`)
        .then(response => {
          const vitalResponse = response.data.vital[0]; // Assuming you only get one record
          setVital(vitalResponse);
        })
        .catch(error => {
          console.error('Error fetching vital data:', error);
        });
    }, [patientUID]);

    const handlePrescriptionChange = (index, key, value) => {
      const newInputs = [...prescriptionInputs];
      newInputs[index][key] = value;
      setPrescriptionInputs(newInputs);
    };
  
    const handleCheckboxChange = (index, checkboxKey) => {
      const newInputs = [...prescriptionInputs];
      newInputs[index][checkboxKey] = !newInputs[index][checkboxKey];
      setPrescriptionInputs(newInputs);
    };
  
    const handlePrescriptionAddInput = () => {
      setPrescriptionInputs([
        ...prescriptionInputs,
        { selectedPrescription: [], dosage: '', durationNumber: '', duration: '', m: false, a: false, e: false, n: false }
      ]);
    };
  
    const handlePrescriptionDeleteInput = (index) => {
      const newInputs = [...prescriptionInputs];
      newInputs.splice(index, 1);
      setPrescriptionInputs(newInputs);
    };
  
    const calculateTotalDosage = (input) => {
      const dosage = parseFloat(input.dosage) || 0;
      const durationNumber = parseInt(input.durationNumber) || 0;
      const durationFactor = input.duration === 'Months' ? 30 : 1;
      const timesSelected = (input.m ? 1 : 0) + (input.a ? 1 : 0) + (input.e ? 1 : 0) + (input.n ? 1 : 0);
      return dosage * timesSelected * durationNumber * durationFactor;
    };

  const handlePlanChange = (event) => {
    const { id, value } = event.target;
    setPlanDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState(''); // 'success' or 'danger'
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const uploaded = files.map((file) => ({
      src: URL.createObjectURL(file),
      alt: file.name,
    }));
    setUploadedImages(prevImages => [...prevImages, ...uploaded]);
    setImages(prevImages => [...prevImages, ...files]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(prevImages =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
    setImages(prevImages =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };
  const handleSubmit2 = async () => {
    if (images.length === 0) {
      setMessage('Please select at least one image');
      return;
    }
    const formData = new FormData();
    formData.append('patient_name', appointment.patientName+'_'+appointment.patientUID+'_'+appointmentDate); // Ensure patientName is included
    images.forEach(image => formData.append('images', image)); // Append each image to formData
    try {
      const response = await axios.post('http://127.0.0.1:8000/upload_file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      setMessage('Failed to upload images');
    }
  };

  const handleSubmit = async () => {
    const summaryData = {
        patientName: patientName,
        patientUID: patientUID,
        mobileNumber: mobileNumber,
        appointmentDate:appointmentDate,
        diagnosis: selectedDiagnosis.map(diagnosis => diagnosis.diagnosis).join(', ') || 'None',
        complaints: selectedComplaints.map(input => ({
          complaints: input.selectedComplaints.map(complaint => complaint.complaints).join(', ') || 'None',
          duration: input.duration || 'N/A',
          durationUnit: input.durationUnit || 'N/A'
      })),
        findings: selectedfindings.map(findings => findings.findings).join(', ') || 'None',
        proceduresList : selectedprocedure.map(procedure => ({
          procedure: procedure.selectedProcedures.map(p => p.procedure).join(', '),
          date: procedure.selectedDate ? formatDate(procedure.selectedDate) : 'None'
        })).map(proc => `Procedure: ${proc.procedure} - Date: ${proc.date}`).join('\n'),
        prescription: prescriptionInputs.map(input => {
            const times = ['M', 'A', 'E', 'N'].map(time => input[time.toLowerCase()] ? time : '').filter(Boolean).join(' ');
            const totalDosage = calculateTotalDosage(input);
            return `Precription: ${input.selectedPrescription?.map(p => p.label).join(', ') || 'None'} - Dosage: ${input.dosage || 'N/A'} - ${times} - Duration: ${input.durationNumber || 'N/A'} ${input.duration || ''} - Total Dosage: ${totalDosage}`;
        }).join('\n'),
        plans: `Plan1: ${planDetails.plan1 || 'None'}\nPlan2: ${planDetails.plan2 || 'None'}\nPlan3: ${planDetails.plan3 || 'None'}`,
        tests: (selectedTests && selectedTests.length > 0)
      ? selectedTests.map(test => test.test).join(', ')
      : 'None',
        uploadedImages: uploadedImages.map(img => ({ src: img.src, alt: img.alt })),
        nextVisit: selectedDate ? formatDate(selectedDate) : null, 
        vital: {
            height: vital?.height || 'N/A',
            weight: vital?.weight || 'N/A',
            pulseRate: vital?.pulseRate || 'N/A',
            bloodPressure: vital?.bloodPressure || 'N/A'
        }
    };
    try {
        const response = await axios.post('http://127.0.0.1:8000/summary/post/', summaryData);
        console.log('Data saved successfully', response.data);
    } catch (error) {
        console.error('Error saving data', error);
    }
};

const [pdfFiles, setPdfFiles] = useState([]);
const [uploadedPdfs, setUploadedPdfs] = useState([]);

const handleFileChange2 = (e) => {
  const files = Array.from(e.target.files);
  const uploaded = files.map((file) => ({
    name: file.name,
  }));
  setUploadedPdfs(prevPdfs => [...prevPdfs, ...uploaded]);
  setPdfFiles(prevPdfs => [...prevPdfs, ...files]);
};

const handleRemoveFile = (indexToRemove) => {
  setUploadedPdfs(prevPdfs =>
    prevPdfs.filter((_, index) => index !== indexToRemove)
  );
  setPdfFiles(prevPdfs =>
    prevPdfs.filter((_, index) => index !== indexToRemove)
  );
};

const handleSubmit3 = async () => {
  if (pdfFiles.length === 0) {
    setMessage('Please select at least one PDF file');
    return;
  }

  const formData = new FormData();
  formData.append('patient_name', `${appointment.patientName}_${appointment.patientUID}_${appointmentDate}`);
  pdfFiles.forEach(pdf => formData.append('pdf_files', pdf)); // Append each PDF to formData

  try {
    const response = await axios.post('http://127.0.0.1:8000/upload_pdf/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    setMessage('PDFs uploaded successfully');
  } catch (error) {
    console.error('Error uploading PDFs:', error);
    setMessage('Failed to upload PDFs');
  }
};

const navigate = useNavigate();
const handleNavigate = () => {
  navigate('/Doctor/BookedAppointments');
};

const handleSubmitAll = async (e) => {
  e.preventDefault();
  try {
    await handleSubmit();
    await handleSubmit2();
    setAlertType('success');
    setMessage(`Prescription Details Were Saved Successfully for ${patientName}`);
    setTimeout(() => {
      handleNavigate();
    }, 3000); // Navigate after 3 seconds
  } catch (error) {
    console.error('Error in handleSubmitAll:', error);
    setAlertType('danger');
    setMessage('Failed to complete operations');
  }
};

const summaryRef = useRef(null);
const getSummaryDetails = () => {
  // Content generation
  const diagnosissummary = selectedDiagnosis.map((diagnosis) => (
    <li key={diagnosis.id}>{diagnosis.diagnosis}</li>
  ));
  const complaintssummary = selectedComplaints.map((input) => {
    const complaintText = input.selectedComplaints.map(complaint => complaint.complaints).join(', ') || 'No complaint provided';
    const duration = input.duration ? ` - Duration: ${input.duration} ${input.durationUnit || 'N/A'}` : '';
    return <li key={input.id}>{complaintText}{duration}</li>;
  });
  const findingssummary = selectedfindings.map((findings) => (
    <li key={findings.id}>{findings.findings}</li>
  ));
  const proceduresummary = selectedprocedure.map((procedure, index) => (
    <li key={index}>
      {procedure.selectedProcedures.map(p => p.procedure).join(', ')} - Date: {procedure.selectedDate ? formatDate(new Date(procedure.selectedDate)) : 'None'}
    </li>
  ));

  const prescriptionSummary = prescriptionInputs.map((input, index) => {
    const times = ['M', 'A', 'E', 'N'].map(time => input[time.toLowerCase()] ? time : '').filter(Boolean).join(' ');
    return `${index + 1}. ${input.selectedPrescription?.map(p => p.label).join(', ') || 'None'} - Dosage: ${input.dosage || 'N/A'} - ${times} - Duration: ${input.durationNumber || 'N/A'} ${input.duration || ''}`;
  }).join('\n') || 'None';

  const plans = [
    `Plan1: ${planDetails.plan1 || 'None'}`,
    `Plan2: ${planDetails.plan2 || 'None'}`,
    `Plan3: ${planDetails.plan3 || 'None'}`
  ].join('\n');

  const testsSummary = selectedTests.map(test => test.test).join(', ') || 'None';
  
  const nextVisitSummary = selectedDate ? formatDate(selectedDate) : 'Not selected';

  const summaryContent = (
    <SummaryDetailsContainer>
      <SummaryTitle>Summary</SummaryTitle>

      {/* Patient Details */}
      <PatientDetailsRow>
        <PatientDetailsColumn>
          <div><strong>NAME:</strong> {appointment.patientName}</div>
          <div><strong>SEX:</strong> {appointment.gender}</div>
        </PatientDetailsColumn>
        <PatientDetailsColumn>
          <div><strong>MOBILE:</strong> {appointment.mobileNumber}</div>
        </PatientDetailsColumn>
      </PatientDetailsRow>
      <Divider />

      {/* Diagnosis */}
      <SummaryItemTitle>Diagnosis</SummaryItemTitle>
      <ul>
        {diagnosissummary}
      </ul>
      <Divider />

      {/* Complaints */}
      <SummaryItemTitle>Complaints</SummaryItemTitle>
      <ul>
        {complaintssummary}
      </ul>
      <Divider />

      {/* Findings */}
      <SummaryItemTitle>Findings</SummaryItemTitle>
      <ul>
        {findingssummary}
      </ul>
      <Divider />

      {/* Procedures */}
      <SummaryItemTitle>Procedures</SummaryItemTitle>
      <ul>
        {proceduresummary}
      </ul>
      <Divider />

      {/* Prescription */}
      <SummaryItemTitle>Prescription</SummaryItemTitle>
      <ul>
        <li>{prescriptionSummary}</li>
      </ul>
      <Divider />

      {/* Plans */}
      <SummaryItemTitle>Plans</SummaryItemTitle>
      <ul>
        <li>{plans}</li>
      </ul>
      <Divider />

      {/* Tests */}
      <SummaryItemTitle>Tests</SummaryItemTitle>
      <ul>
        <li>{testsSummary}</li>
      </ul>
      <Divider />

      {/* Next Visit */}
      <SummaryItemTitle>Next Visit</SummaryItemTitle>
      <ul>
        <li>{nextVisitSummary}</li>
      </ul>
      <Divider />

      {/* Images */}
      <SummaryItemTitle>Images</SummaryItemTitle>
      <ImageContainer>
        {uploadedImages.map((image, index) => (
          <img key={index} src={image.src} alt={image.alt} style={{ maxWidth: '5%', height: 'auto', margin: '10px' }} />
        ))}
        {uploadedImages.length === 0 && <UploadText>No images uploaded</UploadText>}
      </ImageContainer>
    </SummaryDetailsContainer>
  );

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

  const exportToPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const headerFooterHeight = 35;
    // Convert images to Base64
    convertToBase64(PDFHeader, headerImage => {
      convertToBase64(PDFFooter, footerImage => {
        // Header Image - Full width
        pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerFooterHeight);
        let startY = headerFooterHeight + 10;
        // Function to create sub-table rows for sections with multiple entries
        const createSubTableRows = (label, entries) => {
          if (!entries || entries.length === 0) {
            return [[label, 'None']];
          }
          return entries.map((entry, index) => [index === 0 ? label : '', entry]);
        };
        // Prepare the data for the table
        let data = [];
        data = data.concat(createSubTableRows('Diagnosis', selectedDiagnosis.map(d => d.diagnosis)));
        data = data.concat(
          createSubTableRows(
            'Complaints', 
            selectedComplaints.map(input => {
              const complaintText = input.selectedComplaints.map(complaint => complaint.complaints).join(', ') || 'No complaint provided';
              const duration = input.duration ? ` - Duration: ${input.duration} ${input.durationUnit || 'N/A'}` : '';
              return `${complaintText}${duration}`;
            })
          )
        );
        data = data.concat(createSubTableRows('Findings', selectedfindings.map(f => f.findings)));
        // Procedures need special handling to include the date
        data = data.concat(createSubTableRows('Procedures', selectedprocedure.map(p => `${p.selectedProcedures.map(proc => proc.procedure).join(', ')} - Date: ${p.selectedDate ? formatDate(new Date(p.selectedDate)) : 'None'}`)));
        // The rest of the data remains as single entries
        data.push(['Prescription', prescriptionSummary]);
        data.push(['Plans', `${planDetails.plan1 || 'None'}, ${planDetails.plan2 || 'None'}, ${planDetails.plan3 || 'None'}`]);
        data = data.concat(createSubTableRows('Tests', selectedTests.map(test => test.test)));
        data.push(['Next Visit Date', selectedDate ? selectedDate.toLocaleDateString() : 'None']);
        // Create a single table with all the data and adjust the table width
        pdf.autoTable({
          startY,
          head: [['Section', 'Details']],
          body: data,
          theme: 'grid',
          headStyles: { fillColor: [22, 160, 133] },
          styles: {
            cellWidth: 'wrap',
            minCellHeight: 10,
            overflow: 'linebreak',
            tableWidth: 'auto',
            margin: { left: 10, right: 10 },
          },
          columnStyles: {
            0: { cellWidth: 60 }, // First column width
            1: { cellWidth: pageWidth - 80 }, // Second column width
          },
          margin: { top: startY, bottom: headerFooterHeight },
          didDrawPage: (data) => {
            pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerFooterHeight);
            pdf.addImage(footerImage, 'PNG', 0, pageHeight - headerFooterHeight, pageWidth, headerFooterHeight);
          }
        });
        // Add a heading for the images section
        let currentY = pdf.lastAutoTable.finalY + 10;
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Images', 10, currentY);
        // Increment currentY to leave space for the heading
        currentY += 10;
        // Add images in passport size (e.g., 25mm x 30mm) with cells and headings
        const imageWidth = 25; // Width for passport-size image
        const imageHeight = 30; // Height for passport-size image
        const imagesPerRow = Math.floor((pageWidth - 20) / (imageWidth + 5)); // Calculate how many images fit in a row
        let currentRow = 0;
        uploadedImages.forEach((img, index) => {
          const x = 10 + (index % imagesPerRow) * (imageWidth + 5);
          // Check if we need to go to a new page for images
          if (currentY + imageHeight + 20 > pageHeight - headerFooterHeight - 20) { // Extra 20 for the text below images
            pdf.addPage();
            currentY = headerFooterHeight + 10;
            pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerFooterHeight);
            pdf.addImage(footerImage, 'PNG', 0, pageHeight - headerFooterHeight, pageWidth, headerFooterHeight);
            currentRow = 0;
          }
          // Add image
          pdf.addImage(img.src, 'JPEG', x, currentY, imageWidth, imageHeight);
          // Add a heading below the image
          pdf.setFontSize(10);
          pdf.text(`Image ${index + 1}`, x + imageWidth / 4, currentY + imageHeight + 5);
          // Move to the next row if we filled up the current row
          if ((index + 1) % imagesPerRow === 0) {
            currentY += imageHeight + 20; // Move down for the next row of images
          }
        });
        // Save the PDF
        pdf.save(`${appointment.patientName}_${appointment.patientUID}_${appointmentDate}`);
      });
    });
  };
  
  return (
    <div ref={summaryRef}>
      {summaryContent}
      <button onClick={exportToPDF}>Export to PDF</button>
    </div>
  );
};

  return (
    <StyledContainer>
      <Tab.Container defaultActiveKey="consulting-room">
      <Nav style={{ justifyContent: 'center' }}>
        <Nav.Item>
          <Nav.Link eventKey="consulting-room" style={{ color: "#725F83" }}>
            Consulting Room
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="instructions" style={{ color: "#725F83" }}>
            Instructions
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="summary" style={{ color: "#725F83" }}>
            Summary
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <Tab.Pane eventKey="consulting-room">
        <RightContent>
          <PatientDetailsContainer>
            <ProfileImage src={appointment.gender === 'Male' ? male : female} alt="Profile" />
            <PatientName className='mt-1'>Name: {patientName}</PatientName>
            <PatientText className='mt-1'>Phone: {mobileNumber}</PatientText>
            <PatientText className='mt-1'>Height: {vital?.height}</PatientText>
            <PatientText className='mt-1'>Weight: {vital?.weight}</PatientText>
            <PatientText className='mt-1'>Pulse Rate: {vital?.pulseRate}</PatientText>
            <PatientText className='mt-1'>Blood Pressure: {vital?.bloodPressure}</PatientText>
            <PatientText className='mt-1'>Purpose Of Visit: {appointment.purposeOfVisit}</PatientText>
          </PatientDetailsContainer>

        <ContainerRow>
         <Diagnosis onSelectDiagnosis={handleSelectDiagnosis} />
         <Findings onSelectFindings ={handleSelectfindings}/>
         <ImageContainer>
      <label htmlFor="upload-button" style={{ cursor: 'pointer' }}>
        <BiImageAdd style={{ fontSize: '3rem', color: '#757575' }} />
      </label>

      <Form.Group controlId="formFileMultiple" className="mb-3">
        <input
          id="upload-button"
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Form.Group>

      {uploadedImages.length === 0 && (
        <UploadText>No images uploaded yet.</UploadText>
      )}

      {uploadedImages.map((image, index) => (
        <Row key={index} className="mb-2">
          <Col>
            <UploadedImage src={image.src} alt={image.alt} />
          </Col>
          <Col>
            <BiTrash
              style={{ cursor: 'pointer', fontSize: '2rem', color: '#ff0000' }}
              onClick={() => handleRemoveImage(index)}
            />
          </Col>
        </Row>
      ))}

    </ImageContainer>
    <PdfContainer>
      <input type="file" accept="application/pdf" multiple onChange={handleFileChange2} />
      <button onClick={handleSubmit3}>Upload PDFs</button>
      {message && <p>{message}</p>}
      <ul>
        {uploadedPdfs.map((pdf, index) => (
          <PdfItem key={index}>
            {pdf.name}
            <RemoveButton onClick={() => handleRemoveFile(index)}>Remove</RemoveButton>
          </PdfItem>
        ))}
      </ul>
    </PdfContainer>
         </ContainerRow>
         <ContainerRow>
         <Complaints onSelectComplaints={handleSelectComplaints} />
         </ContainerRow>
       <ContainerRow>
    <PrescriptionContainer>
    <SectionTitle>Prescription</SectionTitle>
    {prescriptionInputs.map((input, index) => (
      <Form.Group as={Row} className="align-items-center mb-3" controlId={`prescription-${index}`} key={index}>
        {/* Drug Name Input */}
        <Col sm="3">
          <Typeahead
            labelKey="label"
            multiple
            options={medicineOptions}
            placeholder="Choose prescription..."
            onChange={(selected) => handlePrescriptionChange(index, 'selectedPrescription', selected)}
            selected={input.selectedPrescription || []}
          />
        </Col>
        
        {/* Dosage Input */}
        <Col sm="2">
          <Form.Control
            type="text"
            placeholder="Dosage"
            value={input.dosage || ''}
            onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
          />
        </Col>
        
        {/* Checkbox for M, A, E, N */}
        <Col sm="3">
          <Form.Check inline label="M" type="checkbox" checked={input.m} onChange={() => handleCheckboxChange(index, 'm')} />
          <Form.Check inline label="A" type="checkbox" checked={input.a} onChange={() => handleCheckboxChange(index, 'a')} />
          <Form.Check inline label="E" type="checkbox" checked={input.e} onChange={() => handleCheckboxChange(index, 'e')} />
          <Form.Check inline label="N" type="checkbox" checked={input.n} onChange={() => handleCheckboxChange(index, 'n')} />
        </Col>
        
        {/* Duration Number Input */}
        <Col sm="1">
          <Form.Control
            type="text"
            placeholder="Number"
            value={input.durationNumber || ''}
            onChange={(e) => handlePrescriptionChange(index, 'durationNumber', e.target.value)}
          />
        </Col>
        
        {/* Duration Select */}
        <Col sm="2">
          <Form.Control as="select" value={input.duration || ''} onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}>
            <option value="">Duration</option>
            <option value="Days">Days</option>
            <option value="Months">Months</option>
          </Form.Control>
        </Col>
        
        {/* Add/Delete Buttons */}
        <Col sm="1" className="text-end">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BsPatchPlusFill size={24} onClick={handlePrescriptionAddInput} style={{ cursor: 'pointer', marginLeft: '10px' }} />
            <MdDelete size={24} onClick={() => handlePrescriptionDeleteInput(index)} style={{ cursor: 'pointer', marginLeft: '10px' }} />
          </div>
        </Col>
      </Form.Group>
    ))}
  </PrescriptionContainer>
  </ContainerRow>
</RightContent>
  </Tab.Pane>
      <Tab.Pane eventKey="instructions">
        <PlanContainer>
          <Row className="justify-content-around"> {/* Use 'around' to create equal spacing around items */}
            <Col md="3" className="text-center">
              <Form.Group controlId="plan1">
                <Form.Label>Plan1</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Plan1 details"
                  value={planDetails.plan1}
                  onChange={handlePlanChange}
                />
              </Form.Group>
            </Col>
            <Col md="3" className="text-center">
              <Form.Group controlId="plan2">
                <Form.Label>Plan2</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Plan2 details"
                  value={planDetails.plan2}
                  onChange={handlePlanChange}
                />
              </Form.Group>
            </Col>
            <Col md="3" className="text-center">
              <Form.Group controlId="plan3">
                <Form.Label>Plan3</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Plan3 details"
                  value={planDetails.plan3}
                  onChange={handlePlanChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </PlanContainer>

        <ContainerRow>
          <Tests onSelectTests={handleSelectTests} />
          <Procedures onSelectProcedures={handleSelectprocedure}/>
        </ContainerRow>

        <ContainerRow>
          <NextVisitonContainer>
            <SectionTitle>Next Visit</SectionTitle>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              customInput={<CalendarIcon />}
              popperPlacement="bottom-end"
              dateFormat="dd/MM/yyyy"
            />
            <DateDisplay>
              {selectedDate ? `Next Visit on: ${formatDate(selectedDate)}` : 'Next Visit on: Select a date'}
            </DateDisplay>
          </NextVisitonContainer>
        </ContainerRow>
          </Tab.Pane>
          <Tab.Pane eventKey="summary">
      <MedicalHistoryButton><button  onClick={handleModalOpen}>Medical History</button></MedicalHistoryButton>
      <br/>
      <Modal show={showModal} onHide={handleModalClose} className="custom-modal-width">
        <Modal.Header closeButton>
          <Modal.Title>MedicalHistory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <MedicalHistory/>
        </Modal.Body>
      </Modal>
      <SummaryContainer>
      <center>
        {getSummaryDetails()}
        <button onClick={handleSubmitAll}>
          Save
        </button>
        {message && (
        <div
          className={`alert alert-${alertType}`}
          role="alert"
          style={{
            margin: '0 auto', // Center the alert horizontally
            width: 'fit-content', // Make the alert fit its content
            textAlign: 'center', // Center the text inside the alert
            padding: '10px'
          }}
        >
          {message}
        </div>
      )}
      </center>
    </SummaryContainer>    
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </StyledContainer>
  );
};

export default PrescriptionDetails;