import React, { createContext, useContext, useState } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const BypassAuthContext = createContext({
  isSignedIn: true,
  isLoaded: true,
  user: {
    firstName: 'Rashid',
    lastName: 'Abid',
    fullName: 'Rashid Abid',
    primaryEmailAddress: { emailAddress: 'rashid@ainventory.com' },
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  },
  signOut: () => {},
});

export const useBypassAuth = () => useContext(BypassAuthContext);

export default function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(true);

  if (!publishableKey || publishableKey.trim() === '') {
    const handleSignOut = () => {
      setIsSignedIn(false);
    };

    const handleSignIn = () => {
      setIsSignedIn(true);
    };

    if (!isSignedIn) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#0B0F19] p-4 relative overflow-hidden">
          {/* Glowing background decor */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-border text-center relative z-10 shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.3)] overflow-hidden">
                <div className="absolute inset-[1px] bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <span className="text-sm font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-400">
                    AI
                  </span>
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white flex items-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 font-extrabold">AI</span>
                <span className="text-gray-200 font-medium">nventory</span>
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Signed Out</h2>
            <p className="text-xs text-gray-400 mb-6">You have been successfully logged out of your Guest session.</p>
            
            <button 
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primaryHover hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Sign Back In (Guest Mode)
            </button>
          </div>
        </div>
      );
    }

    return (
      <BypassAuthContext.Provider value={{ 
        isSignedIn: true, 
        isLoaded: true, 
        user: {
          firstName: 'Rashid',
          lastName: 'Abid',
          fullName: 'Rashid Abid',
          primaryEmailAddress: { emailAddress: 'rashid@ainventory.com' },
          imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        }, 
        signOut: handleSignOut 
      }}>
        {children}
      </BypassAuthContext.Provider>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
