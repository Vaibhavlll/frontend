import { createClient } from '@supabase/supabase-js';
import { Conversation } from '../types/conversation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const countryCodeMap: { [key: string]: string } = {
  '91': 'India',
  '1': 'United States/Canada',
  '44': 'United Kingdom',
  '33': 'France',
  '81': 'Japan',
  '86': 'China',
  '49': 'Germany',
  '55': 'Brazil',
  '61': 'Australia'
};

export const syncContactFromConversation = async (conversation: Conversation) => {
  try {
    const { customer_id, customer_name, platform } = conversation;
    const [firstName, ...lastNameParts] = customer_name.split(' ');
    const lastName = lastNameParts.join(' ') || null;
    
    // Generate a default email from customer name
    const defaultEmail = `${firstName.toLowerCase()}${lastName ? `.${lastName.toLowerCase()}` : ''}@${platform}.user`;
    
    if (platform === 'whatsapp') {
      const countryCode = customer_id.slice(0, 2);
      const phoneNumber = customer_id.slice(2);
      const country = countryCodeMap[countryCode] || 'Unknown';

      // First check if contact already exists
      const { data: existingContacts } = await supabase
        .from('contacts')
        .select('id, email')
        .eq('phone', phoneNumber);
      
      if (existingContacts && existingContacts.length > 0) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({
            firstName,
            lastName,
            country,
            platform,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContacts[0].id);
          
        if (error) throw error;
      } else {
        // Insert new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            firstName,
            lastName,
            email: defaultEmail,
            phone: phoneNumber,
            country,
            platform,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      return true;
    } else if (platform === 'instagram') {
      // First check if contact already exists
      const { data: existingContacts } = await supabase
        .from('contacts')
        .select('id, email')
        .eq('insta_username', customer_id);
      
      if (existingContacts && existingContacts.length > 0) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({
            firstName,
            lastName,
            platform,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContacts[0].id);
          
        if (error) throw error;
      } else {
        // Insert new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            firstName,
            lastName,
            email: defaultEmail,
            insta_username: customer_id,
            platform,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      return true;
    }
    
    return false; // Unsupported platform
  } catch (error) {
    console.error('Contact sync failed:', error);
    throw error;
  }
};