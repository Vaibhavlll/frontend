import 'react-phone-number-input/style.css' // Import standard styles
import PhoneInput from 'react-phone-number-input'
import { Loader2 } from 'lucide-react'

interface PhoneNumberInputProps {
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phoneNumber: string;
        planId: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<{ firstName: string, lastName: string, email: string, phoneNumber: string, password: string, planId: string }>>;
    handlePhoneNumberSubmit: () => void;
    loading: boolean;
}

export const PhoneNumberInput = ({ formData, setFormData, handlePhoneNumberSubmit, loading }: PhoneNumberInputProps) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className=" text-2xl sm:text-3xl text-center font-bold text-gray-900 mb-4">Add your number</h1>
            <p className="text-gray-500 mb-8 sm:text-base text-sm text-center">Phone number is mandatory for purchases.</p>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>

                {/* The Library Component */}
                <div className="relative">
                    <PhoneInput
                        placeholder="98654 45698"
                        value={formData.phoneNumber}
                        onChange={(value: string | undefined) => setFormData({ ...formData, phoneNumber: value || "" })}
                        defaultCountry="IN" // Default flag to show

                        // This forces the input to look exactly like your Tailwind design
                        className="flex gap-2"
                        numberInputProps={{
                            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400 text-gray-900"
                        }}
                        // Customizing the flag container to align nicely
                        style={{
                            '--PhoneInputCountrySelectArrowOpacity': '1',
                            '--PhoneInputCountrySelectArrowColor': '#6b7280', 
                            '--PhoneInputCountrySelectArrowWidth': '0.6em',
                            
                            // Adjust flag size to look balanced in the box
                            '--PhoneInputCountryFlagHeight': '22px', 
                        } as React.CSSProperties}
                        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                            if (e.key === 'Enter') {
                                handlePhoneNumberSubmit();
                            }
                        }}
                    />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                    Your data is transmitted securely and will not be shared with third parties without your consent.
                </p>
            </div>

            <button
                onClick={handlePhoneNumberSubmit}
                // Check if value exists and is reasonably long (E.164 usually > 8 chars)
                disabled={loading || !formData.phoneNumber || formData.phoneNumber.length < 8}
                className="w-full py-2.5 bg-black hover:bg-zinc-700 mt-8 hover:cursor-pointer text-white rounded-lg font-medium transition-colors flex justify-center items-center"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Continue to Payment"}
            </button>
        </div>
    )
}