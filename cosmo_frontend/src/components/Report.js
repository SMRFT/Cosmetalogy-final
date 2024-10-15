import React from 'react';
import styled from 'styled-components';
import { FaFileInvoiceDollar } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { HiDocumentText, HiDocumentDuplicate } from "react-icons/hi2";

// Title container with margin to create space at the top
const Container = styled.div`
  margin-top: 65px; /* Added more space between the title and icons */
`;

// Container to center the content on the page
const StyledContainer = styled.div`
  display: flex;
  justify-content: center; /* Centers icons horizontally */
  align-items: center; /* Centers icons vertically */
  flex-direction: column;
  text-align: center;
  background-color: #725F83;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: fit-content;
  padding: 50px;
  color: #E6DEEC;
  margin: 0 auto; /* Centers the container itself on the page */
`;

// Icons container style
const IconsContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center; /* Ensures icons are centered horizontally */
  align-items: center; /* Ensures icons are centered vertically */
`;

// Icon wrapper to keep icon and label together
const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Icon style
const Icon = styled(Link)`
  font-size: 5rem;
  color: white;
  text-decoration: none;
  transition: color 0.3s; /* Smooth color transition on hover */
  
  &:hover {
    color: #E6DEEC; /* Change color on hover if desired */
  }
`;

// Icon label style
const IconLabel = styled.span`
  margin-top: 10px;
  font-size: 1.2rem;
`;

const Report = () => {
  return (
    <Container>
      <h3 className='text-center mb-2'>Report</h3>
      <StyledContainer>
        <IconsContainer>
          <IconWrapper>
            <Icon to="/Doctor/BillingReport">
              <FaFileInvoiceDollar />
            </Icon>
            <IconLabel>Billing Report</IconLabel>
          </IconWrapper>
          <IconWrapper>
            <Icon to="/Doctor/BillingProcedureReport">
              <HiDocumentDuplicate />
            </Icon>
            <IconLabel>Procedure Report</IconLabel>
          </IconWrapper>
          <IconWrapper>
            <Icon to="/Doctor/SummaryReport">
              <HiDocumentText />
            </Icon>
            <IconLabel>Summary Report</IconLabel>
          </IconWrapper>
        </IconsContainer>
      </StyledContainer>
    </Container>
  );
};

export default Report;
