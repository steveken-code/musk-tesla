import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Signup page that redirects to Auth with signup mode preserved.
 * Provides a cleaner URL for referral links: /signup?ref=CODE
 */
const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Preserve query params (including ?ref=CODE) and redirect to auth
    navigate(`/auth${location.search}`, { replace: true });
  }, [navigate, location.search]);
  
  // Return null while redirecting (instant)
  return null;
};

export default Signup;
