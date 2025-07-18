import React from "react";
import styled from "styled-components";
import { Link, NavLink } from "react-router-dom";
import MorePopup from "../MorePopup";
import {
  Logo,
  HomeIcon,
  ExploreIcon,
  NotificationIcon,
  ProfileIcon,
  BmIcon,
} from "../Icons";
import { useAuth } from "../../context/AuthContext";

const Wrapper = styled.nav`
  width: 14.6%;
  padding: 1rem;
  border-right: 1px solid ${(props) => props.theme.tertiaryColor};
  height: 100vh;
  position: fixed;
  font-weight: 500;

  svg {
    width: 28px;
    height: 28px;
    margin-right: 0.5rem;
    position: relative;
    color: ${(props) => props.theme.accentColor};
    top: 7px;
  }

  .logo {
    margin-bottom: 1.3rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  li {
    margin-bottom: 2rem;
  }

  .selected,
  .selected svg {
    color: ${(props) => props.theme.accentColor};
    fill: ${(props) => props.theme.accentColor};
  }

  @media screen and (max-width: 1100px) {
    width: 10%;

    span {
      display: none;
    }

    svg {
      margin-right: 0;
    }

    li {
      margin: none;
    }

    button {
      display: none;
    }
  }

  @media screen and (max-width: 530px) {
    bottom: 0;
    width: 100vw;
    border-right: none;
    height: 4rem;
    border-top: 1px solid ${(props) => props.theme.tertiaryColor};
    z-index: 2;
    background: ${(props) => props.theme.background};

    ul {
      flex-direction: row;
      justify-content: space-between;
    }

    li {
    }

    svg {
      width: 22px;
      height: 22px;
    }
  }

  @media screen and (max-width: 500px) {
  }
`;

const Nav = () => {
  const { user, isAuthenticated } = useAuth();

  // Debug user info to see what fields are available
  console.log('Nav component user data:', user);

  // Get the profile path for the current user
  const getProfilePath = () => {
    if (!user) return '/';

    // Then try username
    if (user.username) return `/${user.username}`;
    
    // Finally fall back to user ID
    return `/users/${user.id}`;
  };

  return (
    <Wrapper>
      <ul>
        <Link to="/">
          <h3 className="logo">
            <Logo />
          </h3>
        </Link>
        <li>
          <NavLink exact activeClassName="selected" to="/">
            <HomeIcon /> <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="selected" to="/explore">
            <ExploreIcon /> <span>Explore</span>
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="selected " to="/notifications">
            <NotificationIcon /> <span>Notifications</span>
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="selected" to="/bookmarks">
            <BmIcon /> <span>Bookmarks</span>
          </NavLink>
        </li>
        {isAuthenticated && user && (
          <li>
            <NavLink activeClassName="selected" to="/settings/profile">
              <ProfileIcon /> <span>Profile</span>
            </NavLink>
          </li>
        )}
        <li>
          <MorePopup />
        </li>
      </ul>
    </Wrapper>
  );
};

export default Nav;
