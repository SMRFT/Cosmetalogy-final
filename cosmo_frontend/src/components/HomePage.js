import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
const HomePage = () => {
    return (
        <div className="homepage-container">
            <div className="links-container">
                <StyledLink to="/DoctorLogin">Doctor Login</StyledLink>
                <StyledLink to="/ReceptionistLogin">Receptionist Login</StyledLink>
                <StyledLink to="/PharmacistLogin">Pharmacist Login</StyledLink>
            </div>
        </div>
    );
};
const StyledLink = ({ to, children }) => (
    <Link to={to} className="styled-link">
        {children}
    </Link>
);
export default HomePage;