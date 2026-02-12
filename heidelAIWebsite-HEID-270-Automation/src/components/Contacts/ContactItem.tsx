import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, MessageSquare } from "lucide-react";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { Contact } from '../types/contacts';

const countryToCodes: { [key: string]: string } = {
  "United States": "US",
  Germany: "DE",
  India: "IN",
  "United Kingdom": "GB",
  France: "FR",
  Japan: "JP",
  China: "CN",
  Brazil: "BR",
  Australia: "AU",
  Canada: "CA",
};

const countryPrefixes: { [key: string]: string } = {
  "United States": "+1",
  Germany: "+49",
  India: "+91",
  "United Kingdom": "+44",
  France: "+33",
  Japan: "+81",
  China: "+86",
  Brazil: "+55",
  Canada: "+1"
};

const avatarColors = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-cyan-500",
];

interface ContactItemProps {
  contact: Contact;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// const shouldHideEmail = (email: string): boolean => {
//   if (!email) return false;
  
//   const emailLower = email.toLowerCase();
//   return emailLower.includes('Not available');
// };

const FlagImage = ({ country }: { country: string }) => {
  const countryCode = countryToCodes[country];
  
  if (!countryCode) return <span className="text-gray-400">🌍</span>;

  return (
    <img
      src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/${countryCode.toLowerCase()}.svg`}
      alt={`${country} flag`}
      className="w-6 h-4 object-cover rounded-sm inline-block"
    />
  );
};

// Platform Logo Component
const PlatformLogo = ({ platform }: { platform: string }) => {
  const platformLower = platform.toLowerCase();
  
  // WhatsApp Logo
  if (platformLower.includes('whatsapp')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path 
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"
          fill="#25D366"
        />
      </svg>
    );
  }
  
  // Instagram Logo
  if (platformLower.includes('instagram')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path 
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
          fill="url(#instagram-gradient)"
        />
        <defs>
          <radialGradient id="instagram-gradient" cx="0%" cy="100%" r="100%">
            <stop offset="0%" stopColor="#fd5" />
            <stop offset="50%" stopColor="#ff543e" />
            <stop offset="100%" stopColor="#c837ab" />
          </radialGradient>
        </defs>
      </svg>
    );
  }
  
  // Telegram Logo
  if (platformLower.includes('telegram')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path 
          d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
          fill="#0088cc"
        />
      </svg>
    );
  }
  
  // Facebook/Meta Logo
  if (platformLower.includes('facebook') || platformLower.includes('meta')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path 
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          fill="#1877F2"
        />
      </svg>
    );
  }
  
  // Twitter/X Logo
  if (platformLower.includes('twitter') || platformLower.includes('x.com')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path 
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          fill="#000000"
        />
      </svg>
    );
  }
  
  // LinkedIn Logo
  if (platformLower.includes('linkedin')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path 
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          fill="#0077B5"
        />
      </svg>
    );
  }
  
  // Discord Logo
  if (platformLower.includes('discord')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path 
          d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"
          fill="#5865F2"
        />
      </svg>
    );
  }
  
  return <MessageSquare className="w-4 h-4 text-gray-500" />;
};

  const ProfileAvatar = ({ firstName, lastName, profileUrl }: { 
    firstName: string; 
    lastName?: string;
    profileUrl?: string | null;
  }) => {
    const [imageError, setImageError] = useState(false);

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    const initials = lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;
    const colorIndex = firstName.charCodeAt(0) % avatarColors.length;
    const bgColor = avatarColors[colorIndex];
    
    if (profileUrl && !imageError) {
      return (
        <img 
          src={profileUrl} 
          alt={`${firstName} ${lastName || ''}`}
          className="w-10 h-10 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0"
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div className={`flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-full ${bgColor} text-white font-medium text-sm sm:text-lg flex-shrink-0`}>
        {initials}
      </div>
    );
  };

export const ContactItem = ({ contact, onEdit, onDelete }: ContactItemProps) => {
  const formattedTags = Array.isArray(contact.categories) && contact.categories.length > 0
    ? contact.categories.join(', ')
    : '';

  const formattedPhone = contact.phone && contact.country
    ? `${countryPrefixes[contact.country] ?? ""} ${contact.phone}`
    : contact.phone;

  const showEmail = contact.email != null && contact.email !== '';

  // const hideEmail = shouldHideEmail(contact.email);
  
return (
  <div className="group bg-white rounded-xl shadow-sm p-2 sm:p-3 mb-2 sm:mb-0.5
                  transition-all border border-gray-100 hover:shadow-lg hover:border-indigo-50
                  h-[88px] sm:h-[80px]">
    <div className="flex items-center gap-3 h-full">
      {/* Profile Avatar */}
      <div className="flex-shrink-0">
        <ProfileAvatar 
          firstName={contact.firstName} 
          lastName={contact.lastName} 
          profileUrl={contact.profile_url} 
        />
      </div>
      
      {/* Main Content */}
<div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 overflow-hidden">
  {/* Top Row: Name */}
  <div className="flex items-center justify-between gap-3">
    <h3 className="font-sans text-xs font-medium">
      {contact.firstName} {contact.lastName}
    </h3>
  </div>

  {/* Middle Row: Contact Details */}
  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
        {showEmail && contact.email && (
      <span className="truncate max-w-[180px]">{contact.email}</span>
    )}
    {contact.username && (
      <span className="truncate">@{contact.username}</span>
    )}
    {formattedPhone && (
      <span className="truncate">{formattedPhone}</span>
    )}

    {/* Tags */}
    {contact.tags && contact.tags.length > 0 && (
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 
                      scrollbar-track-transparent hover:scrollbar-thumb-slate-400 mr-2">
        {contact.tags.map((tag) => (
          <span 
            key={tag} 
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                       bg-blue-50 text-blue-700 border border-blue-200
                       hover:bg-blue-100 whitespace-nowrap flex-shrink-0"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
</div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {contact.platform && <PlatformLogo platform={contact.platform} />}
            {contact.country && <FlagImage country={contact.country} />}
          </div>

      {/* Actions Dropdown */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger 
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 
                       rounded-lg transition-colors
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Contact actions"
          >
            <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem 
              onClick={() => onEdit(contact.id)}
              className="flex items-center px-3 py-2 text-sm text-gray-700 
                         hover:bg-indigo-50 hover:text-indigo-900 cursor-pointer
                         focus:bg-indigo-50 focus:text-indigo-900"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Contact
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onDelete(contact.id)}
              className="flex items-center px-3 py-2 text-sm text-red-600 
                         hover:bg-red-50 hover:text-red-700 cursor-pointer
                         focus:bg-red-50 focus:text-red-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
);
};

export default ContactItem;