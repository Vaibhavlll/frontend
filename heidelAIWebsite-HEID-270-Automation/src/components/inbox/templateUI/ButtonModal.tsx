import { Button } from '@/components/types/template_types';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';



type ButtonModalProps = {
  newButton: Button;
  setNewButton: React.Dispatch<React.SetStateAction<Button>>;
  setShowButtonModal: (show: boolean) => void;
  addButton: () => void;
};

export const ButtonModal: React.FC<ButtonModalProps> = ({
  newButton,
  setNewButton,
  setShowButtonModal,
  addButton
}) => {


  return (
    <Dialog open={true} onOpenChange={(open) => !open && setShowButtonModal(false)}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <DialogDescription className="sr-only">
          Add a call-to-action or quick reply button to your template.
        </DialogDescription>
        <div className="bg-white p-6 w-full">
          <DialogTitle className="text-lg font-semibold mb-4 text-left">Add Button</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Type
              </label>
              <select
                value={newButton.type}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'reply' || value === 'url' || value === 'phone' || value === 'copy') {
                    setNewButton({ ...newButton, type: value });
                  } else {
                    // Handle unexpected button type values explicitly to avoid silent failures
                    // eslint-disable-next-line no-console
                    console.error('Unexpected button type value received:', value);
                    toast.error("Unexpected button type value received")
                  }
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="reply">Quick Reply</option>
                <option value="url">URL</option>
                <option value="phone">Phone Number</option>
                <option value="copy">Copy Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={newButton.text}
                onChange={(e) => setNewButton({ ...newButton, text: e.target.value })}
                placeholder="Enter button text"
                className="w-full p-2 border rounded-md"
                maxLength={20}
              />
            </div>
            {(newButton.type === 'url' || newButton.type === 'phone' || newButton.type === 'copy') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newButton.type === 'url' ? 'URL' : newButton.type === 'phone' ? 'Phone Number' : 'Text to Copy'}
                </label>
                <input
                  type={newButton.type === 'phone' ? 'tel' : 'text'}
                  value={newButton.value || ''}
                  onChange={(e) => setNewButton({ ...newButton, value: e.target.value })}
                  placeholder={
                    newButton.type === 'url'
                      ? 'https://example.com'
                      : newButton.type === 'phone'
                        ? '+1234567890'
                        : 'Text to copy'
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowButtonModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addButton}
              disabled={!newButton.text}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              Add Button
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};