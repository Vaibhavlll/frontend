import React, { useState } from "react";


interface AppSetup {
  packageName: string;
  signatureHash: string;
}

interface AuthTemplateProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  languages: string[];
  codeDeliveryMethod: string;
  setCodeDeliveryMethod: React.Dispatch<React.SetStateAction<"zero_tap" | "one_tap" | "copy_code">>
  addSecurityRecommendation: boolean;
  addExpirationTime: boolean;
  setAddExpirationTime: (value: boolean) => void;
  validityPeriod: string;
  autofillText: string;
  setAutofillText: (text: string) => void;
  setAddSecurityRecommendation: (value: boolean) => void;
  setValidityPeriod: (period: string) => void;
  copyCodeText: string;
  setCopyCodeText: (text: string) => void;
  apps: AppSetup[];
  setApps: React.Dispatch<React.SetStateAction<AppSetup[]>>;
  customValidityPeriod: boolean;
  setCustomValidityPeriod: (value: boolean) => void;
  validityPeriods: string[];

}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  templateName,
  setTemplateName,
  language,
  setLanguage,
  languages,
  codeDeliveryMethod,
  setCodeDeliveryMethod,
  addSecurityRecommendation,
  setAddSecurityRecommendation,
  addExpirationTime,
  setAddExpirationTime,
  validityPeriod,
  autofillText,
  setAutofillText,
  setValidityPeriod,
  copyCodeText,
  setCopyCodeText,
  apps,
  setApps,
  customValidityPeriod,
  setCustomValidityPeriod,
  validityPeriods,
}) => {
  // State for code delivery method
  const [termsAccepted, setTermsAccepted] = useState(false);




  const addApp = () => {
    if (apps.length < 5) {
      setApps([...apps, { packageName: "", signatureHash: "" }]);
    }
  };

  const updateApp = (index: number, field: keyof AppSetup, value: string) => {
    const newApps = [...apps];
    newApps[index] = { ...newApps[index], [field]: value };
    setApps(newApps);
  };

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template name
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter a template name"
            className="w-full p-2 border rounded-md"
            maxLength={512}
          />
          <div className="text-xs text-gray-500 mt-1">
            {templateName.length} / 512
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-6">
        {/* Code Delivery Setup */}
        <div>
          <h3 className="text-md font-semibold mb-3">Code delivery setup</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose how customers send the code from WhatsApp to your app.
          </p>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="radio"
                checked={codeDeliveryMethod === "zero_tap"}
                onChange={() => setCodeDeliveryMethod("zero_tap")}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Zero-tap autofill</div>
                <p className="text-sm text-gray-600">
                  Automatically sends code without requiring customer
                  interaction.
                </p>
                {codeDeliveryMethod === "zero-tap" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1"
                      />
                      <div className="text-sm">
                        I accept the WhatsApp Business Terms of Service for
                        zero-tap authentication.
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="radio"
                checked={codeDeliveryMethod === "one_tap"}
                onChange={() => setCodeDeliveryMethod("one_tap")}
                className="mt-1"
              />
              <div>
                <div className="font-medium">One-tap autofill</div>
                <p className="text-sm text-gray-600">
                  Code sends when customers tap the button.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="radio"
                checked={codeDeliveryMethod === "copy_code"}
                onChange={() => setCodeDeliveryMethod("copy_code")}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Copy code</div>
                <p className="text-sm text-gray-600">
                  Customers manually copy and paste the code.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* App Setup */}
        <div>
          <h3 className="text-md font-semibold mb-3">App setup</h3>
          <p className="text-sm text-gray-600 mb-4">
            You can add up to 5 apps.
          </p>

          {apps.map((app, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Package name
                </label>
                <input
                  type="text"
                  value={app.packageName}
                  onChange={(e) =>
                    updateApp(index, "packageName", e.target.value)
                  }
                  placeholder="com.example.myapplication"
                  className="w-full p-2 border rounded-md"
                  maxLength={224}
                />
                <div className="text-right text-sm text-gray-500">
                  {app.packageName.length}/224
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  App signature hash
                </label>
                <input
                  type="text"
                  value={app.signatureHash}
                  onChange={(e) =>
                    updateApp(index, "signatureHash", e.target.value)
                  }
                  placeholder="Enter hash"
                  className="w-full p-2 border rounded-md"
                  maxLength={11}
                />
                <div className="text-right text-sm text-gray-500">
                  {app.signatureHash.length}/11
                </div>
              </div>
            </div>
          ))}

          {apps.length < 5 && (
            <button
              onClick={addApp}
              className="text-green-600 font-medium hover:text-green-700"
            >
              Add another app
            </button>
          )}
        </div>

        {/* Content Settings */}
        <div>
          <h3 className="text-md font-semibold mb-3">Content</h3>
          <p className="text-sm text-gray-600 mb-4">
            Content for authentication message templates can&apos;t be edited. You
            can add additional content from the options below.
          </p>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={addSecurityRecommendation}
                onChange={(e) => setAddSecurityRecommendation(e.target.checked)}
              />
              <span>Add security recommendation</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={addExpirationTime}
                onChange={(e) => setAddExpirationTime(e.target.checked)}
              />
              <span>Add expiration time for the code</span>
            </label>
          </div>
        </div>

        {/* Button Text */}
        <div>
          <h3 className="text-md font-semibold mb-3">Buttons</h3>
          <p className="text-sm text-gray-600 mb-3">
            Customize button text for autofill and copy code.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Autofill text
              </label>
              <input
                type="text"
                value={autofillText}
                onChange={(e) => setAutofillText(e.target.value)}
                className="w-full p-2 border rounded-md"
                maxLength={25}
              />
              <div className="text-right text-sm text-gray-500">
                {autofillText.length}/25
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Copy code text
              </label>
              <input
                type="text"
                value={copyCodeText}
                onChange={(e) => setCopyCodeText(e.target.value)}
                className="w-full p-2 border rounded-md"
                maxLength={25}
              />
              <div className="text-right text-sm text-gray-500">
                {copyCodeText.length}/25
              </div>
            </div>
          </div>
        </div>

        {/* Validity Period */}
        <div>
          <h3 className="text-md font-semibold mb-3">
            Message validity period
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Set a custom validity period for your authentication message.
            </p>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={customValidityPeriod}
                onChange={(e) => setCustomValidityPeriod(e.target.checked)}
              />
              <span>Set custom validity period for your message</span>
            </label>

            {customValidityPeriod && (
              <div className="ml-7">
                <p className="text-sm text-gray-600 mb-2">
                  Default validity period is 10 minutes if not customized.
                </p>
                <select
                  value={validityPeriod}
                  onChange={(e) => setValidityPeriod(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {validityPeriods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTemplate;
