import React from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  
  h2 {
    color: ${props => props.theme.primary};
    margin-bottom: 1rem;
  }

  button {
    background: ${props => props.theme.accentColor};
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Error caught by boundary:', error, info);
    toast.error('Something went wrong. Please try again.');
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try again.</p>
          <button onClick={this.handleReset}>
            Reload Page
          </button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;