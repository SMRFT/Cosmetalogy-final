import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

function VitalForm({ patientUID, patientName, mobileNumber }) {
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        pulseRate: '',
        bloodPressure: '',
        patientUID: patientUID,
        patientName: patientName,
        mobileNumber: mobileNumber
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form Data Submitted: ', formData);
        try {
            const vitalResponse = await axios.post('http://127.0.0.1:8000/vitalform/', formData);
            console.log('Vital Data:', vitalResponse.data);
            setSuccessMessage(`Vital data for ${patientName} submitted successfully!`);
            setErrorMessage('');
            setFormData({
                height: '',
                weight: '',
                pulseRate: '',
                bloodPressure: '',
                patientUID: patientUID,
                patientName: patientName,
                mobileNumber: mobileNumber
            });
        } catch (error) {
            setErrorMessage('Error submitting form data. Please try again.');
            setSuccessMessage('');
        }
    };

    return (
        <FormContainer>
            <Form onSubmit={handleSubmit}>
                {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                <FormRow>
                    <FormGroup>
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                            type="text"
                            id="height"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                            type="text"
                            id="weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                </FormRow>
                <FormRow>
                    <FormGroup>
                        <Label htmlFor="pulseRate">Pulse Rate (bpm)</Label>
                        <Input
                            type="text"
                            id="pulseRate"
                            name="pulseRate"
                            value={formData.pulseRate}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                        <Input
                            type="text"
                            id="bloodPressure"
                            name="bloodPressure"
                            value={formData.bloodPressure}
                            onChange={handleChange}
                            placeholder="e.g., 120/80"
                            required
                        />
                    </FormGroup>
                </FormRow>
                <ButtonContainer>
                    <button type="submit">Submit</button>
                </ButtonContainer>
            </Form>
        </FormContainer>
    );
}

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-image: url${'/images/background-vital.jpg'};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const FormRow = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;

    & > div {
        flex: 1;
        margin-right: 10px;
    }

    & > div:last-child {
        margin-right: 0;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
`;

const Label = styled.label`
    font-size: 14px;
    margin-bottom: 5px;
    display: block;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    box-sizing: border-box;
`;

const SuccessMessage = styled.p`
    color: green;
    font-size: 14px;
    margin-bottom: 10px;
    text-align: center;
`;

const ErrorMessage = styled.p`
    color: red;
    font-size: 14px;
    margin-bottom: 10px;
    text-align: center;
`;

export default VitalForm;
