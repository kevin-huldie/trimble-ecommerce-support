import React from 'react';
import { useSandbox } from '../context/SandboxContext';

export const MainHeader: React.FC = () => {
  const { currentRole } = useSandbox();

  // Dynamically derive avatar initials based on the active role persona
  const getInitials = (role: string): string => {
    switch (role) {
      case 'Customer Support':
        return 'JD'; // John Doe / Support Agent
      case 'E-Payments Team':
        return 'EP';
      case 'Administrator':
        return 'AD';
      default:
        return 'JD';
    }
  };

  return (
    <header className="w-full border-b border-[#E5E9EB] bg-white">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Lockup: Trimble Wordmark + Portal Descriptor */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-xl font-black tracking-tight text-[#0063A3]">
            Trimble
          </span>
          <span className="text-sm font-normal text-[#5C6670]">
            Support Portal
          </span>
        </div>

        {/* User Session Profile Icon */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0063A3] text-xs font-bold text-white shadow-sm transition hover:bg-[#004F82] focus:outline-none focus:ring-2 focus:ring-[#0063A3] focus:ring-offset-2"
            aria-label={`Logged in as ${currentRole} (${getInitials(currentRole)})`}
            title={`Active Persona: ${currentRole}`}
          >
            {getInitials(currentRole)}
          </button>
        </div>

      </div>
    </header>
  );
};

export default MainHeader;