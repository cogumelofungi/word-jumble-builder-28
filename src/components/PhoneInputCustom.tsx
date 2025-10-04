import PhoneInput from "react-phone-number-input";
import { getCountryCallingCode } from "react-phone-number-input/input";
import { parsePhoneNumber, AsYouType } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import "./PhoneInputCustom.css";

interface PhoneInputCustomProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  required?: boolean;
}

export const PhoneInputCustom = ({ value, onChange, placeholder, required }: PhoneInputCustomProps) => {
  const handleChange = (newValue: string | undefined) => {
    if (!newValue) {
      onChange(newValue);
      return;
    }

    try {
      // Parse the phone number to get country info
      const phoneNumber = parsePhoneNumber(newValue);
      if (phoneNumber) {
        const country = phoneNumber.country;
        // Use AsYouType for formatting and validation
        const formatter = new AsYouType(country);
        const formatted = formatter.input(newValue);
        
        // Only update if the input is valid or being typed
        if (phoneNumber.isPossible() || newValue.length <= formatted.length) {
          onChange(newValue);
        }
      } else {
        onChange(newValue);
      }
    } catch (error) {
      // Allow typing even if parsing fails initially
      onChange(newValue);
    }
  };

  return (
    <div className="phone-input-wrapper">
      <PhoneInput
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        defaultCountry="BR"
        international
        countryCallingCodeEditable={false}
        required={required}
        className="phone-input-custom"
        numberInputProps={{
          className: "phone-number-input"
        }}
      />
    </div>
  );
};