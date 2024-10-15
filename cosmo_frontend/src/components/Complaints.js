import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import { BsPatchPlusFill} from "react-icons/bs";
import { MdDelete } from "react-icons/md";

const ComplaintsContainer = styled.div`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color: #b798c0; // Light brown background
  border-radius: 10px;
  text-align: center;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Complaints = ({ onSelectComplaints }) => {
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintsInputs, setComplaintsInputs] = useState([{ selectedComplaints: [], duration: '', durationUnit: '' }]);
  const [selectedComplaints, setSelectedComplaints] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newComplaint, setNewComplaint] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/complaints/')
      .then(response => {
        setComplaintsList(response.data);
      })
      .catch(error => {
        console.error('Error fetching complaints data:', error);
      });
  }, []);

  const handleAddNewComplaint = () => {
    // Check if newComplaint is not empty before submitting
    if (newComplaint.trim() === '') {
      setSuccessMessage('Please enter a valid complaint.');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
  
    axios.post('http://127.0.0.1:8000/complaints/', { complaints: newComplaint })
      .then(response => {
        // Directly update the complaintsList with the newly added complaint
        setComplaintsList(prevComplaints => [...prevComplaints, response.data]);
  
        // Reset the new complaint input and close the add input section
        setShowAddInput(false);
        setNewComplaint('');
  
        // Show a success message
        setSuccessMessage('New complaint added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(error => {
        console.error('Error adding new complaint:', error);
        setSuccessMessage('Failed to add complaint. Please try again.');
        setTimeout(() => setSuccessMessage(''), 3000);
      });
  };

  useEffect(() => {
    onSelectComplaints(complaintsInputs);
  }, [complaintsInputs, onSelectComplaints]);
  

  const handleComplaintChange = (selected, index) => {
    const newComplaintsInputs = [...complaintsInputs];
    newComplaintsInputs[index].selectedComplaints = selected;
    setComplaintsInputs(newComplaintsInputs);
  };

  const handleDurationChange = (e, index) => {
    const newComplaintsInputs = [...complaintsInputs];
    newComplaintsInputs[index].duration = e.target.value;
    setComplaintsInputs(newComplaintsInputs);
  };

  const handleDurationUnitChange = (e, index) => {
    const newComplaintsInputs = [...complaintsInputs];
    newComplaintsInputs[index].durationUnit = e.target.value;
    setComplaintsInputs(newComplaintsInputs);
  };

  const handleAddNewSection = () => {
    const newComplaintsInputs = [...complaintsInputs, { selectedComplaints: [], duration: '', durationUnit: '' }];
    setComplaintsInputs(newComplaintsInputs);
    onSelectComplaints(newComplaintsInputs); // Trigger update to parent
  };
  
  const handleRemoveSection = (index) => {
    const updatedComplaintsInputs = complaintsInputs.filter((_, i) => i !== index);
    setComplaintsInputs(updatedComplaintsInputs);
    onSelectComplaints(updatedComplaintsInputs); // Trigger update to parent
  };

  return (
    <ComplaintsContainer>
      {complaintsInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <Col md="3">
            <Form.Group controlId={`complaints-${index}`}>
              <Form.Label>Complaints</Form.Label>
              <Typeahead
                className="ms-2"
                id={`complaints-typeahead-${index}`}
                labelKey="complaints"
                onChange={selected => handleComplaintChange(selected, index)}
                options={complaintsList}
                placeholder="Select Complaints"
                selected={Array.isArray(input.selectedComplaints) ? input.selectedComplaints : []}
                multiple
              />
            </Form.Group>
          </Col>

          {/* Duration Inputs */}
          <Col md="2">
            <Form.Group controlId={`duration-${index}`}>
              <Form.Label>Duration</Form.Label>
              <Form.Control
                type="text"
                value={input.duration || ''}
                onChange={(e) => handleDurationChange(e, index)}
                placeholder="Enter duration"
              />
            </Form.Group>
          </Col>

          <Col md="2">
            <Form.Group controlId={`duration-unit-${index}`}>
              <Form.Label>Duration Unit</Form.Label>
              <Form.Control
                as="select"
                value={input.durationUnit || ''}
                onChange={(e) => handleDurationUnitChange(e, index)}
              >
                <option value="">Select Unit</option>
                <option value="Days">Days</option>
                <option value="Months">Months</option>
                <option value="Years">Years</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col sm="1" className="text-end">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BsPatchPlusFill size={24} onClick={handleAddNewSection} style={{ cursor: 'pointer', marginLeft: '10px' }} />
              <MdDelete size={24} onClick={() => handleRemoveSection(index)} style={{ cursor: 'pointer', marginLeft: '10px' }} />
            </div>
          </Col>
        </Row>
      ))}

      {/* New Complaint Input Section */}
      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <Col md="4">
            <Form.Group controlId="new-complaint">
              <Form.Label>New Complaint</Form.Label>
              <FlexContainer>
                <Form.Control
                  type="text"
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  placeholder="Enter new complaint"
                />
                <Button onClick={handleAddNewComplaint} style={{ marginLeft: '10px' }}>
                  Save
                </Button>
              </FlexContainer>
            </Form.Group>
          </Col>
        </Row>
      )}

      {/* Button to show/hide the new complaint input field */}
      <button onClick={() => setShowAddInput(!showAddInput)} className="mt-3">
        {showAddInput ? 'Close' : 'Add New Complaint'}
      </button>

      {successMessage && (
        <Alert variant="success" style={{ marginTop: '20px' }}>
          {successMessage}
        </Alert>
      )}

      {/* Display selected complaints */}
      {selectedComplaints.length > 0 && (
        <div>
          <h2>Selected Complaints:</h2>
          <ul>
            {selectedComplaints.map(complaint => (
              <li key={complaint.id}>{complaint.complaints}</li>
            ))}
          </ul>
        </div>
      )}
    </ComplaintsContainer>
  );
};

export default Complaints;
