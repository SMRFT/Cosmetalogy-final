import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BsPatchPlusFill, BsPlus } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import styled from 'styled-components';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';

const DiagnosisContainer = styled.div`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color: #b798c0; // Light brown background
  border-radius: 10px;
  text-align: center;
`;

const CenteredFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Diagnosis = ({ onSelectDiagnosis }) => {
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [diagnosisInputs, setDiagnosisInputs] = useState([{ selectedDiagnosis: [] }]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/diagnoses/')
      .then(response => {
        setDiagnosisList(response.data);
      })
      .catch(error => {
        console.error('Error fetching diagnosis data:', error);
      });
  }, []);

 

  const handleAddNewDiagnosis = () => {
    axios.post('http://127.0.0.1:8000/diagnoses/', { diagnosis: newDiagnosis })
      .then(response => {
        setDiagnosisList([...diagnosisList, response.data]);
        setShowAddInput(false);
        setNewDiagnosis('');
        setSuccessMessage('New diagnosis stored successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(error => console.error('Error adding new diagnosis:', error));
  };

  const handleDiagnosisChange = (selected, index) => {
    const newDiagnosisInputs = [...diagnosisInputs];
    newDiagnosisInputs[index].selectedDiagnosis = selected;
    setDiagnosisInputs(newDiagnosisInputs);
    onSelectDiagnosis(selected);
  };

  return (
    <DiagnosisContainer>
      {diagnosisInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <CenteredFormGroup as={Col} md="4" controlId={`diagnosis-${index}`}>
            <Form.Label>Diagnosis</Form.Label>
            <FlexContainer>
             
              <Typeahead
                className="ms-2"
                id={`diagnosis-typeahead-${index}`}
                labelKey="diagnosis"
                onChange={(selected) => handleDiagnosisChange(selected, index)}
                options={diagnosisList}
                placeholder="Select Diagnosis"
                selected={input.selectedDiagnosis}
                multiple
              />
              
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      ))}

      {/* New Diagnosis Input Section */}
      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>New Diagnosis</Form.Label>
            <FlexContainer>
              <Form.Control
                type="text"
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                placeholder="Enter new diagnosis"
              />
              <Button onClick={handleAddNewDiagnosis} style={{ marginLeft: '10px' }}>
                Save
              </Button>
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      )}

      {/* Button to show/hide the new diagnosis input field */}
      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Diagnosis'}
      </button>

      {successMessage && (
        <Alert variant="success" style={{ marginTop: '20px' }}>
          {successMessage}
        </Alert>
      )}

      {/* Display selected diagnoses */}
      {selectedDiagnosis.length > 0 && (
        <div>
          <h2>Selected Diagnosis:</h2>
          <ul>
            {selectedDiagnosis.map(diagnosis => (
              <li key={diagnosis.id}>{diagnosis.diagnosis}</li>
            ))}
          </ul>
        </div>
      )}
    </DiagnosisContainer>
  );
};

export default Diagnosis;