import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BsPatchPlusFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { AiOutlineCalendar } from 'react-icons/ai';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProceduresContainer = styled.div`
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

const DateDisplay = styled.div`
  margin-top: 10px;
  text-align: center;
`;

const CalendarIcon = styled(AiOutlineCalendar)`
  cursor: pointer;
`;

const Procedures = ({ onSelectProcedures }) => {
  const [proceduresList, setProceduresList] = useState([]);
  const [proceduresInputs, setProceduresInputs] = useState([{ selectedProcedures: [], selectedDate: null }]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newProcedure, setNewProcedure] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/Procedure/')
      .then(response => {
        const formattedProceduresList = response.data.map(procedure => ({
          procedure: procedure.procedure || ""  // Ensure "procedure" key exists and has a string value
        }));
        setProceduresList(formattedProceduresList);
      })
      .catch(error => {
        console.error('Error fetching procedures data:', error);
      });
  }, []);

  const handleAddInput = () => {
    setProceduresInputs([...proceduresInputs, { selectedProcedures: [], selectedDate: null }]);
  };

  const handleDeleteInput = (index) => {
    const newInputs = proceduresInputs.filter((_, i) => i !== index);
    setProceduresInputs(newInputs);
    onSelectProcedures(newInputs.flatMap(input => input.selectedProcedures)); // Update selected procedures
  };

  const handleAddNewProcedure = () => {
    // Ensure we only submit a valid procedure string
    if (newProcedure.trim() === '') {
      return;
    }
  
    const newProcedureData = { procedure: newProcedure };
  
    axios.post('http://127.0.0.1:8000/Procedure/', newProcedureData)
      .then(response => {
        setProceduresList([...proceduresList, response.data]);  // Update the procedures list with the newly added procedure
        setShowAddInput(false);  // Close the input for new procedure
        setNewProcedure('');  // Clear the input
        setSuccessMessage('New procedure added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);  // Remove the success message after 3 seconds
      })
      .catch(error => {
        console.error('Error adding new procedure:', error);
      });
  };
  

  const handleDateChange = (date, index) => {
    const newInputs = [...proceduresInputs];
    newInputs[index].selectedDate = date;
    setProceduresInputs(newInputs);
    onSelectProcedures(newInputs); // Update selected procedures
  };
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <ProceduresContainer>
    {proceduresInputs.map((input, index) => (
      <Row className="justify-content-center mb-3" key={index}>
        <CenteredFormGroup as={Col} md="4" controlId={`procedures-${index}`}>
          <Form.Label>Procedures</Form.Label>
          <FlexContainer>
            <BsPatchPlusFill size={24} onClick={handleAddInput} />
            <Typeahead
              className='ms-2'
              id={`procedures-typeahead-${index}`}
              labelKey="procedure"
              onChange={selected => {
                const newInputs = [...proceduresInputs];
                newInputs[index] = { ...newInputs[index], selectedProcedures: selected };
                setProceduresInputs(newInputs);
                onSelectProcedures(newInputs); // Update selected procedures
              }}
              options={proceduresList}
              placeholder="Select Procedures"
              selected={Array.isArray(input.selectedProcedures) ? input.selectedProcedures : []}
              multiple
            />
            <MdDelete size={24} onClick={() => handleDeleteInput(index)} />
            <DatePicker
              selected={input.selectedDate}
              onChange={date => handleDateChange(date, index)}
              customInput={<CalendarIcon size={24} />}
              popperPlacement="bottom-end"
              dateFormat="dd/MM/yyyy"
            />
          </FlexContainer>
          <DateDisplay>
            {input.selectedDate ? `Procedure Date: ${formatDate(input.selectedDate)}` : 'Procedure Date: Select a date'}
          </DateDisplay>
        </CenteredFormGroup>
      </Row>
    ))}
      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <Col md="4">
            <Form.Group controlId="new-Procedure">
              <Form.Label>New Procedure</Form.Label>
              <FlexContainer>
                <Form.Control
                  type="text"
                  value={newProcedure}
                  onChange={(e) => setNewProcedure(e.target.value)}
                  placeholder="Enter new Procedure"
                />
                <Button onClick={handleAddNewProcedure} style={{ marginLeft: '10px' }}>
                  Save
                </Button>
              </FlexContainer>
            </Form.Group>
          </Col>
        </Row>
      )}

      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Procedure'}
      </button>

      {successMessage && (
        <Alert variant="success" style={{ marginTop: '20px' }}>
          {successMessage}
        </Alert>
      )}
    </ProceduresContainer>
  );
};

export default Procedures;