import React, { useState, useEffect } from 'react';
import { Form, Container, Table, Button, Alert } from 'react-bootstrap';
import { FaDownload, FaArrowAltCircleRight } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import styled from 'styled-components';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Notification from './Notification';

const Pharmacy = () => {
  const [formData, setFormData] = useState([{
    medicineName: '',
    companyName: '',
    price: '',
    CGSTPercentage: '',
    CGSTValue: '',
    SGSTPercentage: '',
    SGSTValue: '',
    newStock: '',
    oldStock: '',
    receivedDate: '',
    expiryDate: '',
    batchNumber: ''
  }]);

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/pharmacy/data/')
      .then((response) => {
        console.log('Fetched data:', response.data);
        if (response.data.length === 0) {
          setFormData([{
            medicineName: '',
            companyName: '',
            price: '',
            CGSTPercentage: '',
            CGSTValue: '',
            SGSTPercentage: '',
            SGSTValue: '',
            newStock: '',
            oldStock: '',
            receivedDate: '',
            expiryDate: '',
            batchNumber: ''
          }]);
        } else {
          setFormData(response.data.map(item => ({
            medicineName: item.medicine_name ? capitalizeFirstLetter(item.medicine_name.toLowerCase()) : '',
            companyName: item.company_name,
            price: item.price,
            CGSTPercentage: item.CGST_percentage,
            CGSTValue: item.CGST_value,
            SGSTPercentage: item.SGST_percentage,
            SGSTValue: item.SGST_value,
            newStock: '',
            oldStock: item.old_stock ? item.old_stock.toString() : '',
            receivedDate: formatDate(item.received_date),
            expiryDate: formatDate(item.expiry_date),
            batchNumber: item.batch_number
          })));
        }
      })
      .catch(error => {
        console.error('There was an error fetching the data:', error);
      });
  }, []);

  const calculateTaxValues = (price, percentage, type) => {
    const priceValue = parseFloat(price) || 0;
    const percentageValue = parseFloat(percentage) || 0;
    const value = (priceValue * percentageValue) / 100;
    return { [type]: value.toFixed(2) };
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newFormData = [...formData];
    newFormData[index][name] = value;

    if (name === 'price' || name === 'CGSTPercentage') {
      const { CGSTValue } = calculateTaxValues(
        newFormData[index].price,
        newFormData[index].CGSTPercentage,
        'CGSTValue'
      );
      newFormData[index].CGSTValue = CGSTValue;
    }

    if (name === 'price' || name === 'SGSTPercentage') {
      const { SGSTValue } = calculateTaxValues(
        newFormData[index].price,
        newFormData[index].SGSTPercentage,
        'SGSTValue'
      );
      newFormData[index].SGSTValue = SGSTValue;
    }

    setFormData(newFormData);
  };

  const handleKeyPress = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewRow();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = formData.map(item => ({
      medicine_name: item.medicineName,
      company_name: item.companyName,
      price: item.price,
      CGST_percentage: item.CGSTPercentage,
      CGST_value: item.CGSTValue,
      SGST_percentage: item.SGSTPercentage,
      SGST_value: item.SGSTValue,
      new_stock: item.newStock ? parseInt(item.newStock, 10) : 0,
      received_date: formatDate(item.receivedDate),
      expiry_date: formatDate(item.expiryDate),
      batch_number: item.batchNumber,
      old_stock: parseInt(item.oldStock, 10)
    }));
  
    // Determine if the data needs to be posted or updated
    const method = formattedData.some(item => item.old_stock !== 0) ? 'PUT' : 'POST';
  
    axios({
      method: method,
      url: 'http://127.0.0.1:8000/pharmacy/data/',
      data: formattedData,
    })
    .then(response => {
      console.log('Data submitted successfully:', response.data);
      setSubmitSuccess(true);
      setSubmitError(null);
    })
    .catch(error => {
      console.error('There was an error submitting the form:', error);
      setSubmitError('There was an error submitting the form.');
      setSubmitSuccess(false);
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedYear = date.getFullYear();
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(date.getDate()).padStart(2, '0');
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };

  const addNewRow = () => {
    setFormData([
      ...formData,
      {
        medicineName: '',
        companyName: '',
        price: '',
        CGSTPercentage: '',
        CGSTValue: '',
        SGSTPercentage: '',
        SGSTValue: '',
        newStock: '',
        oldStock: '',
        receivedDate: '',
        expiryDate: '',
        batchNumber: ''
      }
    ]);
  };

  const removeRow = (index) => {
    const newFormData = [...formData];
    newFormData.splice(index, 1);
    setFormData(newFormData);
  };

  const handleStockUpdate = (index) => {
    const newFormData = [...formData];
    const newStockValue = parseInt(newFormData[index].newStock, 10) || 0;
    const oldStockValue = parseInt(newFormData[index].oldStock, 10) || 0;
    newFormData[index].oldStock = (oldStockValue + newStockValue).toString();
    newFormData[index].newStock = ''; // Reset new stock after adding
    setFormData(newFormData);
  };
  
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pharmacy Data");
    XLSX.writeFile(workbook, "PharmacyData.xlsx");
  };

  return (
    <StyledContainer>
        <h3 className="text-center mb-4">Pharmacy Stock</h3>
        {submitSuccess && (
          <SuccessMessage>Pharmacy data submitted successfully!</SuccessMessage>
        )}
        {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
        <button style={{float:"right",marginRight:"20px",marginTop:"-60px"}} title='Download Excel' onClick={downloadExcel}>
          <FaDownload />
        </button>
        <Form onSubmit={handleSubmit}>
          <TableContainer>
            <table striped bordered hover>
              <thead>
                <tr style={{whiteSpace:"nowrap"}}>
                  <th>Medicine Name</th>
                  <th>Company Name</th>
                  <th>Price</th>
                  <th>CGST %</th>
                  <th>CGST</th>
                  <th>SGST %</th>
                  <th>SGST</th>
                  <th>New Stock</th>
                  <th>Old Stock</th>
                  <th>Received Date</th>
                  <th>Expiry Date</th>
                  <th>Batch Number</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {formData.map((data, index) => (
                  <tr key={index}>
                    <td>
                      <StyledFormControl
                        style={{width:'200px'}}
                        type="text"
                        placeholder="Enter medicine name"
                        name="medicineName"
                        value={data.medicineName}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>
                    <td>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter company name"
                        name="companyName"
                        value={data.companyName}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>
                    <td>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter price"
                        name="price"
                        value={data.price}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>
                    <td>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter CGST %"
                        name="CGSTPercentage"
                        value={data.CGSTPercentage}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>
                    <td>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter CGST Value"
                        name="CGSTValue"
                        value={data.CGSTValue}
                        readOnly
                      />
                    </td>
                    <td>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter SGST %"
                        name="SGSTPercentage"
                        value={data.SGSTPercentage}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>
                    <td>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter SGST Value"
                        name="SGSTValue"
                        value={data.SGSTValue}
                        readOnly
                      />
                    </td>

                    <td>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <StyledFormControl
                          type="text"
                          placeholder="Enter new stock"
                          name="newStock"
                          value={data.newStock}
                          onChange={(e) => handleChange(index, e)}
                          onKeyPress={(e) => handleKeyPress(index, e)}
                        />
                        <IconButton type='button' onClick={() => handleStockUpdate(index)}>
                          <FaArrowAltCircleRight />
                        </IconButton>
                      </div>
                    </td>
                    <td>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter old stock"
                        name="oldStock"
                        value={data.oldStock}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>
                    <td>
                      <StyledFormControl
                        type="date"
                        placeholder="Enter received date"
                        name="receivedDate"
                        value={data.receivedDate}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>
                    <td>
                      <StyledFormControl
                        type="date"
                        placeholder="Enter expiry date"
                        name="expiryDate"
                        value={data.expiryDate}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>

                    <td>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter batch number"
                        name="batchNumber"
                        value={data.batchNumber}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                    </td>
                    <td style={{textAlign:"center"}}>
                      <RemoveIcon>
                        <RiDeleteBin5Line onClick={() => removeRow(index)} title='Delete Row'/>
                      </RemoveIcon>
                    </td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
          <ButtonContainer>
            <button style={{fontSize:"1.5rem",marginRight:"10px"}} onClick={addNewRow} type="button">+</button>
            <button style={{marginRight:"5px"}} type="submit">Submit </button>
          </ButtonContainer>
        </Form>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
padding:5px;
margin-top: 65px;
`;

const TableContainer = styled.div`
  max-height: 430px;
  overflow-y: auto;
  scrollbar-width: thin;
`;

const StyledFormControl = styled(Form.Control)`
  min-width: 70px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6B4A8F; // Adjust the color as needed

  svg {
    font-size: 1.2rem;
  }

`;

const SuccessMessage = styled(Alert).attrs({
  variant: 'success',
})`
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
`;

const ErrorMessage = styled(Alert).attrs({
  variant: 'danger',
})`
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

const RemoveIcon = styled.div`
  color: #6B4A8F;
  cursor: pointer;

  svg {
    font-size: 1.3rem;
  }

  &:hover {
    color: darkred;
  }
`;


export default Pharmacy;
