import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import SignOut from './SignOut';

const Doctor = ({ appointments }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/Doctor') {
      navigate('BookedAppointments');
    }
  }, [navigate]);


  return (
    <div>
    </div>
  );
};

Doctor.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Doctor;
