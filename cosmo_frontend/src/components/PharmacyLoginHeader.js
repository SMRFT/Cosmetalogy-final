import React from 'react';
import styled from 'styled-components';
import Notification from './Notification';
import Logo from './images/salem-cosmetic-logo.png';
import SignOut from './SignOut';

const PharmacyLoginHeader = () => {
  return (
    <>
    <TopContainer>
      <HeaderRight>
          <Notification />
          <SignOut />
        </HeaderRight>
      </TopContainer>
    <HeaderContainer>
      <HeaderLeft>
        <LogoContainer>
          <img src={Logo} alt="Logo" />
        </LogoContainer>
      </HeaderLeft>
    </HeaderContainer>
    </>
  );
};

const TopContainer = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: radial-gradient(circle, #A07BC6 0%, #7F54A9 100%);
  z-index: 1001;
  padding: 0 15px;
`;

const HeaderContainer = styled.header`
  position: fixed;
  top: 50px; /* Position it right below the TopContainer */
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 15px;
  z-index: 1000;


  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const LogoContainer = styled.div`
  img {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    max-width: 150px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
  }
`;
export default PharmacyLoginHeader;
