import { useUser, useClerk } from '@clerk/clerk-react';
import { useBypassAuth } from '../components/AuthProvider';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function useAppAuth() {
  if (!publishableKey || publishableKey.trim() === '') {
    return useBypassAuth();
  }

  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
  };
}
