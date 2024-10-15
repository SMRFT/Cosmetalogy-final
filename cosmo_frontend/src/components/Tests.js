import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BsPatchPlusFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';
import styled from 'styled-components';


const TestsContainer = styled.div`
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


const Tests = ({ onSelectTests }) => {
  const [testsList, setTestsList] = useState([]);
  const [testsInputs, setTestsInputs] = useState([{ selectedTests: [] }]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTest, setNewTest] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/Tests/')
      .then(response => {
        // Ensure each object in the array has the "test" key with string values
        const formattedTestsList = response.data.map(test => ({
          test: test.test || ""  // Ensure "test" key exists and has a string value
        }));
        setTestsList(formattedTestsList);
      })
      .catch(error => {
        console.error('Error fetching tests data:', error);
      });
  }, []);

  const handleAddInput = () => {
    setTestsInputs([...testsInputs, { selectedTests: [] }]);
  };

  const handleDeleteInput = (index) => {
    const newInputs = testsInputs.filter((_, i) => i !== index);
    setTestsInputs(newInputs);
  };

  const handleAddNewTest = () => {
    axios.post('http://127.0.0.1:8000/Tests/', { test: newTest })
      .then(response => {
        setTestsList([...testsList, response.data]);
        setShowAddInput(false);
        setNewTest('');
        setSuccessMessage('New test stored successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(error => console.error('Error adding new test:', error));
  };

  const handleRemoveTest = (inputIndex, testIndex) => {
    const newInputs = [...testsInputs];
    newInputs[inputIndex].selectedTests.splice(testIndex, 1);
    setTestsInputs(newInputs);
  };

  const handleTestChange = (selected, index) => {
    const newInputs = [...testsInputs];
    newInputs[index].selectedTests = selected;
    setTestsInputs(newInputs);
    onSelectTests(selected);
  };

  return (
    <TestsContainer>
      {testsInputs.map((input, inputIndex) => (
        <Row className="justify-content-center mb-3" key={inputIndex}>
          <CenteredFormGroup as={Col} md="4" controlId={`tests-${inputIndex}`}>
            <Form.Label>Tests</Form.Label>
            <FlexContainer>
              <Typeahead
                className='ms-2'
                id={`tests-typeahead-${inputIndex}`}
                labelKey="test"
                multiple
                onChange={(selected) => handleTestChange(selected, inputIndex)}
                options={testsList}
                placeholder="Select Tests"
                selected={Array.isArray(input.selectedTests) ? input.selectedTests : []}
              />
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      ))}

      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>New Test</Form.Label>
            <FlexContainer>
              <Form.Control
                type="text"
                value={newTest}
                onChange={(e) => setNewTest(e.target.value)}
                placeholder="Enter new test"
              />
              <Button onClick={handleAddNewTest} style={{ marginLeft: '10px' }}>Save</Button>
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      )}

      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Test'}
      </button>

      {successMessage && (
        <Alert variant="success" style={{ marginTop: '20px' }}>
          {successMessage}
        </Alert>
      )}

     
    </TestsContainer>
  );
};

export default Tests;