import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ZenithLogo } from './Landing';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { oauthLogin } = useAuth();
  
  const [status, setStatus] = useState('loading'); // loading, error
  const [errorMsg, setErrorMsg] = useState('');
  
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Prevent React StrictMode from exchanging the one-time code twice
    if (hasAttempted.current) return;
    
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      hasAttempted.current = true;
      setStatus('error');
      setErrorMsg(`Google authentication failed: ${error}`);
      return;
    }

    if (!code) {
      hasAttempted.current = true;
      setStatus('error');
      setErrorMsg('No authorization code found.');
      return;
    }

    hasAttempted.current = true;

    async function processCode() {
      const result = await oauthLogin(code);
      if (result.success) {
        // Strip code from URL and navigate to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'Authentication failed. Please try again.');
      }
    }

    processCode();
  }, [location.search, navigate, oauthLogin]);

  return (
    <div className="min-h-screen bg-[#09090d] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
        <ZenithLogo size={48} />
        
        {status === 'loading' ? (
          <>
            <h2 className="text-xl font-semibold mt-6 mb-2">Authenticating...</h2>
            <p className="text-slate-400 text-sm">Please wait while we securely log you in.</p>
            <div className="mt-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-6 mt-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-slate-400 text-sm mb-8">{errorMsg}</p>
            <Link 
              to="/login"
              className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-slate-200 transition-colors w-full"
            >
              Return to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
