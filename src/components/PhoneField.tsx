import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  required?: boolean;
}

export const PhoneField = ({ value, onChange, placeholder, required }: PhoneFieldProps) => {
  return (
    <div className="phone-field-wrapper">
      <PhoneInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        defaultCountry="BR"
        international
        countryCallingCodeEditable={false}
        required={required}
        className="flex h-10 w-full rounded-md border border-app-border bg-app-surface-hover px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        numberInputProps={{
          className: "flex-1 border-0 bg-transparent outline-none focus:outline-none"
        }}
      />
    </div>
  );
};