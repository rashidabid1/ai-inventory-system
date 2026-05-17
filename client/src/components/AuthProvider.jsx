import React, { createContext, useContext } from 'react';
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
  if (!publishableKey || publishableKey.trim() === '') {
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
        signOut: () => alert('Signing out of local development session.') 
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
