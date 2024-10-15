import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { PiTestTubeThin } from "react-icons/pi";
import Image2 from './images/diagnosis.png';
import Image3 from './images/Findings.png';
import Image1 from './images/Complaints.png';

const Container = styled.div`
    display: flex;
    height: 75vh;  /* Adjust this height as needed */
    overflow: hidden;
`;

const Sidebar = styled.div`
    width: 30%;
    border-right: 1px solid #ddd;
    padding: 10px;
    background-color: #D3E7EE;
    overflow-y: auto;
`;

const AppointmentItem = styled.div`
    cursor: pointer;
    margin-bottom: 10px;
    padding: 10px;
    background-color: ${props => props.isActive ? '#A5D8FF' : '#F1FBFD'};
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 5px solid ${props => props.isChronic ? '#9AE6B4' : '#FEB2B2'};

    &:hover {
        background-color: #e6f7ff;
    }

    &:active {
        background-color: #F1FBFD;
    }
`;

const ImageCell = styled.td`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    border: 1px solid #ddd;
`;

export const PdfCell = styled.td`
  padding: 10px;
  background-color: #f0f0f0; // Light background for the PDF section
  border-radius: 5px;
  a {
    color: #007bff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PatientInfo = styled.div`
    display: flex;
    align-items: center;
`;

const PatientDetails = styled.div`
    display: flex;
    flex-direction: column;
    width: 150px;
`;

const PatientText = styled.p`
    font-size: 0.8em;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DateInfo = styled.div`
    font-size: 0.8em;
    color: #888;
    width: 100px;
`;

const FormType = styled.div`
    font-size: 0.8em;
    color: ${props => props.isChronic ? '#48BB78' : '#E53E3E'};
`;

const Content = styled.div`
    width: 70%;
    padding: 20px;
    overflow-y: auto;
    scrollbar-width: thin;
`;

const PrescriptionTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
`;

const TableHeader = styled.th`
    padding: 8px;
`;

const TableRow = styled.tr`
    &:nth-child(even) {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.td`
    padding: 8px;
`;

const TestsList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const DiagnosisList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const DiagnosisItem = styled.li`
    margin-bottom: 5px;
`;

const ComplaintsList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const ComplaintsItem = styled.li`
    margin-bottom: 5px;
`;
const FindingsList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const FindingsItem = styled.li`
    margin-bottom: 5px;
`;
const TestItem = styled.li`
    margin-bottom: 5px;
`;

const Section = styled.div`
    margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
    color: black;
    margin-bottom: 10px;
    font-size: 1rem;
`;

const SectionContent = styled.p`
    margin: 5px 0;
`;

const VitalsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2x;
`;

const VitalItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const VitalLabel = styled.span`
    font-size: 0.9em;
    color: #888;
    margin-top: 5px;
`;
const Row = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;
`;
const DiagnosisContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#E2DEFF;
    flex: 1;
    overflow-y: auto;
    height:200px;
    scrollbar-width: none;
    width:fit-content;
`;

const ComplaintsContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#E2DEFF;
    flex: 1;
    overflow-y: auto;
    height:200px;
    scrollbar-width: none;
    width:fit-content;
`;

const FindingsContainer = styled.div`
     margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#F8DEFF;
    flex: 1;
    overflow-y: auto;
   height:200px;
    scrollbar-width: none;
    width:fit-content;
`;
const TestContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#DDE8FF;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    width:fit-content;
`;

const PlansContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#E2DEFF;
    flex: 1;
    overflow-y: auto;
    height:fit-content;
    scrollbar-width: none;
    width:fit-content;
`;

const PlansList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const PlansItem = styled.li`
    margin-bottom: 5px;
`;

const ProceduresContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#E2DEFF;
    flex: 1;
    overflow-y: auto;
    height:fit-content;
    scrollbar-width: none;
    width:fit-content;
`;

const ProceduresList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const ProceduresItem = styled.li`
    margin-bottom: 5px;
`;
const PdfButton = styled.a`
    display: block;
    width: 200px; /* Set the desired width here */
    background-color: #4CAF50;
    color: white;
    text-align: center;
    padding: 10px;
    margin: 10px auto; /* Center the button horizontally */
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    transition: background-color 0.3s;

    &:hover {
        background-color: #45a049;
    }
`;

const MedicalHistory = () => {
   const location = useLocation();
    const { appointment, patientUID } = location.state || {};
    const [patientDetails, setPatientDetails] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [imageSrcs, setImageSrcs] = useState({});

    useEffect(() => {
        if (patientUID) {
            const handleFetchDetails = async () => {
                try {
                    const response = await axios.post('http://127.0.0.1:8000/get_patient_details/', { patientUID });
                    setPatientDetails(response.data);
    
                    const imagesAndPdfs = await Promise.all(response.data.map(async (detail) => {
                        const dateStr = new Date(detail.appointmentDate).toISOString().split('T')[0];
                        
                        // Fetch images
                        const imageArray = [];
                        for (let i = 0; i <= 5; i++) {
                            const imageFilename = `${detail.patientName}_${detail.patientUID}_${dateStr}_${i}.jpg`;
                            try {
                                const imageResponse = await axios.get(`http://127.0.0.1:8000/get_file/?filename=${imageFilename}`, {
                                    responseType: 'blob',
                                });
                                imageArray.push({
                                    src: URL.createObjectURL(imageResponse.data),
                                    filename: imageFilename
                                });
                            } catch (error) {
                                console.error(`Error fetching image ${i}:`, error);
                            }
                        }
    
                        // Fetch PDFs
                        const pdfArray = [];
                        for (let j = 0; j <= 2; j++) {  // Adjust index range as needed
                            const pdfFilename = `${detail.patientName}_${detail.patientUID}_${dateStr}_${j}.pdf`;
                            try {
                                const pdfResponse = await axios.get(`http://127.0.0.1:8000/get_pdf_file/?filename=${pdfFilename}`, {
                                    responseType: 'blob',
                                });
                                pdfArray.push({
                                    src: URL.createObjectURL(pdfResponse.data),
                                    filename: pdfFilename
                                });
                            } catch (error) {
                                console.error(`Error fetching PDF ${j}:`, error);
                            }
                        }
    
                        return { 
                            appointmentDate: detail.appointmentDate, 
                            images: imageArray, 
                            pdfs: pdfArray 
                        };
                    }));
    
                    // Group images and PDFs by appointment date
                    const groupedFiles = imagesAndPdfs.reduce((acc, { appointmentDate, images, pdfs }) => {
                        acc[appointmentDate] = acc[appointmentDate] || { images: [], pdfs: [] };
                        acc[appointmentDate].images = acc[appointmentDate].images.concat(images);
                        acc[appointmentDate].pdfs = acc[appointmentDate].pdfs.concat(pdfs);
                        return acc;
                    }, {});
    
                    setImageSrcs(groupedFiles);
                } catch (error) {
                    console.error('Error fetching patient details:', error);
                }
            };
            handleFetchDetails();
        }
    }, [patientUID]);
    
    
    

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
    };

    return (
        <Container>
            <Sidebar>
                {patientDetails.length > 0 ? (
                    patientDetails.map((detail, index) => (
                        <AppointmentItem
                            key={index}
                            onClick={() => handleAppointmentClick(detail)}
                            isChronic={detail.formType === 'Chronic form'}
                        >
                            <PatientInfo>
                                <PatientDetails>
                                    <PatientText>{detail.patientName}</PatientText>
                                    <PatientText>{detail.patientUID}</PatientText>
                                    <FormType isChronic={detail.formType === 'Chronic form'}>{detail.formType}</FormType>
                                </PatientDetails>
                            </PatientInfo>
                            <DateInfo>
                                <p>{new Date(detail.appointmentDate).toLocaleDateString()}</p>
                            </DateInfo>
                        </AppointmentItem>
                    ))
                ) : (
                    <p>No appointments found for the provided UID.</p>
                )}
            </Sidebar>
            <Content>
                {selectedAppointment ? (
                    <div>
                       <Row>
                       <DiagnosisContainer>
                <Section style={{ flex: 1 }}>
                    <img src={Image2} style={{height: "20%", width: "20%"}} alt="Diagnosis" />
                    <SectionTitle className='mt-2'>Diagnosis</SectionTitle>
                    <DiagnosisList>
                        {selectedAppointment.diagnosis.split('\n').map((diagnosis, index) => (
                            <DiagnosisItem key={index}>{diagnosis.trim()}</DiagnosisItem>
                        ))}
                    </DiagnosisList>
                </Section>
            </DiagnosisContainer>




                           
                            <FindingsContainer>
                            <Section style={{ flex: 1 }}>
                            <img src={Image3} style={{height:"20%",width:"20%"}} alt="Findings" />
                            <SectionTitle className='mt-2'>Findings</SectionTitle>
                            <FindingsList>
                        {selectedAppointment.findings.split('\n').map((findings, index) => (
                            <FindingsItem key={index}>{findings.trim()}</FindingsItem>
                        ))}
                    </FindingsList>
                        </Section>
                        </FindingsContainer>
                        </Row>
                       
    <Section style={{ flex: 1 }}>
        {/* <img src={Image1} style={{height:"20%",width:"20%"}} alt="Complaints" /> */}
        <SectionTitle className='mt-2'>Complaints</SectionTitle>
        {selectedAppointment.complaints.length > 0 ? (
            <PrescriptionTable>
                <thead>
                    <tr>
                        <TableHeader>Complaints</TableHeader>
                        <TableHeader>Duration</TableHeader>
                        <TableHeader>Duration Unit</TableHeader>
                    </tr>
                </thead>
                <tbody>
                    {selectedAppointment.complaints.map((complaint, index) => (
                        <TableRow key={index}>
                            <TableCell>{complaint.complaints}</TableCell>
                            <TableCell>{complaint.duration}</TableCell>
                            <TableCell>{complaint.durationUnit}</TableCell>
                        </TableRow>
                    ))}
                </tbody>
                </PrescriptionTable>
        ) : (
            <p>No complaints recorded.</p>
        )}
    </Section>
                        <Section>
                        <SectionTitle>Prescription:</SectionTitle>
                        <PrescriptionTable>
                            <thead>
                                <tr>
                                    <TableHeader>Medication</TableHeader>
                                    <TableHeader>Dosage</TableHeader>
                                    <TableHeader>Frequency</TableHeader>
                                    <TableHeader>Duration</TableHeader>
                                    <TableHeader>Total Dosage</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                            {selectedAppointment.prescription.split('\n').map((line, index) => {
                                    const parts = line.split('-').map(part => part.trim());
                                    console.log('Parts:', parts); // Log parts to debug
                                
                                    const medication = parts[0] ? parts[0].split(': ')[1] : 'N/A';
                                    const dosage = parts[1] ? parts[1].split(': ')[1] : 'N/A';
                                    const frequency = parts[2] ? parts[2] : 'N/A'; // Directly assign the part without splitting
                                    const duration = parts[3] ? parts[3].split(': ')[1] : 'N/A';
                                    const totalDosage = parts[4] ? parts[4].split(': ')[1] : 'N/A';
                                

                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{medication}</TableCell>
                                            <TableCell>{dosage}</TableCell>
                                            <TableCell>{frequency}</TableCell>
                                            <TableCell>{duration}</TableCell>
                                            <TableCell>{totalDosage}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </tbody>
                        </PrescriptionTable>
                    </Section>

                        <PlansContainer>
                        <Section>
                            <SectionTitle>Plans</SectionTitle>
                            <PlansList>
                            {selectedAppointment.plans.split('\n').map((item, index) => (
                                <PlansItem key={index}>{item}</PlansItem>
                            ))}
                            </PlansList>
                        </Section>
                        </PlansContainer>


                        <TestContainer>
                        <Section>
                            <PiTestTubeThin style={{ fontSize: "2rem" }} />
                            <SectionTitle className='mt-2'>Tests</SectionTitle>
                            <TestsList>
                                {selectedAppointment.tests.split(',').map((test, index) => (
                                    <TestItem key={index}>{test.trim()}</TestItem>
                                ))}
                            </TestsList>
                        </Section>
                    </TestContainer>

                      <ProceduresContainer>
                        <Section>
                            <SectionTitle>Procedures</SectionTitle>
                            <ProceduresList>
                            <ProceduresItem>{selectedAppointment.procedures}</ProceduresItem>
                            </ProceduresList>
                        </Section>
                        </ProceduresContainer>
                        <Section>
                        {imageSrcs[selectedAppointment.appointmentDate] && (
                        <tr>
                            <SectionTitle>Records & Images</SectionTitle>
                            <ImageCell>
                            {imageSrcs[selectedAppointment.appointmentDate]?.images?.length > 0 && (
                        <Section>
                        
                        
                                {imageSrcs[selectedAppointment.appointmentDate].images.map((image, imgIndex) => (
                                    <img 
                                        key={imgIndex} 
                                        src={image.src} 
                                        alt={image.filename} 
                                        style={{ width: '100px' }} 
                                    />
                                ))}
                        
                        </Section>
                    )}

                            </ImageCell>
                        </tr>
                    )}

                    {imageSrcs[selectedAppointment.appointmentDate] && imageSrcs[selectedAppointment.appointmentDate].pdfs.length > 0 && (
                        <Section>
                            <SectionTitle>PDF Documents</SectionTitle>
                            <div>
                                {imageSrcs[selectedAppointment.appointmentDate].pdfs.map((pdf, pdfIndex) => (
                                    <PdfButton 
                                        key={pdfIndex} 
                                        href={pdf.src} 
                                        target="_blank" 
                                        rel="noopener noreferrer">
                                        View PDF {pdfIndex + 1}
                                    </PdfButton>
                                ))}
                            </div>
                        </Section>
                    )}


                        </Section>

                        <Section>
                            <SectionTitle>Next Visit:</SectionTitle>
                            <SectionContent>{selectedAppointment.nextVisit}</SectionContent>
                        </Section>
                        {selectedAppointment.vital && (
                            <Section>
                                <SectionTitle>Vitals</SectionTitle>
                                <VitalsContainer>
                                    {Object.entries(selectedAppointment.vital).map(([key, value]) => (
                                        <VitalItem key={key}>
                                            <SectionContent>{value}</SectionContent>
                                            <VitalLabel>{key}</VitalLabel>
                                        </VitalItem>
                                    ))}
                                </VitalsContainer>
                            </Section>
                        )}
                    </div>
                ) : (
                    <p>Select an appointment to view details.</p>
                )}
            </Content>
        </Container>
    );
};

export default MedicalHistory;