import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

const Reception = ({ appointments }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/Reception') {
      navigate('Appointment');
    }
  }, [navigate]);


  return (
    <div>
    </div>
  );
};

export default Reception;
