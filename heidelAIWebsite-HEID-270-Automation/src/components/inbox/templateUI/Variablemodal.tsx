import { Variable } from '@/components/types/template_types';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';



type VariableModalProps = {
  newVariable: Variable;
  setNewVariable: (variable: Variable) => void;
  setShowVariableModal: (show: boolean) => void;
  addVariable: () => void;
};

export const VariableModal: React.FC<VariableModalProps> = ({
  newVariable,
  setNewVariable,
  setShowVariableModal,
  addVariable,

}) => {


  return (
    <Dialog open={true} onOpenChange={(open) => !open && setShowVariableModal(false)}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <DialogDescription className="sr-only">
          Add a variable to your template section.
        </DialogDescription>
        <div className="bg-white p-6 w-full">
          <DialogTitle className="text-lg font-semibold mb-4 text-left">
            Add {newVariable.section === 'header' ? 'Header' : 'Body'} Variable
          </DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variable Name
              </label>
              <input
                type="text"
                value={newVariable.name}
                onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                placeholder="Enter variable name"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variable Type
              </label>
              <select
                value={newVariable.type}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'text' || value === 'number') {
                    setNewVariable({ ...newVariable, type: value });
                  } else {
                    console.error(`Unexpected variable type value: ${value}, falling back to 'text'.`);
                    setNewVariable({ ...newVariable, type: 'text' });
                  }
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Example Value
              </label>
              <input
                type="text"
                value={newVariable.example}
                onChange={(e) => setNewVariable({ ...newVariable, example: e.target.value })}
                placeholder="Enter example value"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowVariableModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addVariable}
              disabled={!newVariable.name || !newVariable.example}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              Add Variable
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};