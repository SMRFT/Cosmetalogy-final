import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BsPatchPlusFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';
import styled from 'styled-components';

const FindingsContainer = styled.div`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color: #b798c0; // Light brown background
  border-radius: 10px;
  text-align: center;
`;

const CenteredFormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Findings = ({ onSelectFindings }) => {
  const [findingsList, setFindingsList] = useState([]);
  const [findingsInputs, setFindingsInputs] = useState([{ selectedFindings: [] }]);
  const [selectedFindings, setSelectedFindings] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newFinding, setNewFinding] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/Findings/')
      .then(response => {
        setFindingsList(response.data);
      })
      .catch(error => {
        console.error('Error fetching findings data:', error);
      });
  }, []);

  const handleAddInput = () => {
    setFindingsInputs([...findingsInputs, { selectedFindings: [] }]);
  };

  const handleDeleteInput = (index) => {
    const newInputs = findingsInputs.filter((_, i) => i !== index);
    setFindingsInputs(newInputs);
  };

  const handleAddNewFinding = () => {
    axios.post('http://127.0.0.1:8000/Findings/', { findings: newFinding })
      .then(response => {
        setFindingsList([...findingsList, response.data]);
        setShowAddInput(false);
        setNewFinding('');
        setSuccessMessage('New finding stored successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(error => console.error('Error adding new finding:', error));
  };

  const handleFindingChange = (selected, index) => {
    const newFindingsInputs = [...findingsInputs];
    newFindingsInputs[index].selectedFindings = selected;
    setFindingsInputs(newFindingsInputs);
    setSelectedFindings(newFindingsInputs.flatMap(input => input.selectedFindings)); // Update selected findings
    onSelectFindings(newFindingsInputs.flatMap(input => input.selectedFindings));
  };

  return (
    <FindingsContainer>
      {findingsInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <CenteredFormGroup as={Col} md="4" controlId={`findings-${index}`}>
            <Form.Label>Findings</Form.Label>
            <FlexContainer>

              <Typeahead
                className="ms-2"
                id={`findings-typeahead-${index}`}
                labelKey="findings"  // Adjust if necessary
                onChange={selected => handleFindingChange(selected, index)}
                options={findingsList}  // Ensure this is the correct array of objects
                placeholder="Select Findings"
                selected={Array.isArray(input.selectedFindings) ? input.selectedFindings : []}
                multiple
              />

            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      ))}

      {/* New Finding Input Section */}
      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>New Finding</Form.Label>
            <FlexContainer>
              <Form.Control
                type="text"
                value={newFinding}
                onChange={(e) => setNewFinding(e.target.value)}
                placeholder="Enter new finding"
              />
              <Button onClick={handleAddNewFinding} style={{ marginLeft: '10px' }}>Save</Button>
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      )}

      {/* Button to show/hide the new finding input field */}
      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Finding'}
      </button>

      {successMessage && (
        <Alert variant="success" style={{ marginTop: '20px' }}>
          {successMessage}
        </Alert>
      )}

    </FindingsContainer>
  );
};

export default Findings;