import { formatReminderDate } from "../../utils";
import { Reminder } from "../../types";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Check, X } from "lucide-react";

export const RemindersPopover = ({
  reminders,
  onCreateReminder,
  doneReminder,
  snoozeReminder,
  snoozing,
  completing,
  activeCount,
  deleteReminder
}: {
  reminders: Reminder[];
  onCreateReminder: () => void;
  doneReminder: (id: string) => void;
  snoozeReminder: ({ reminderId, snoozeUntil }: { reminderId: string, snoozeUntil: number }) => void;
  snoozing: boolean;
  completing: boolean;
  activeCount: number;
  deleteReminder: (id: string) => void;
}) => {



  return (
    <PopoverContent className="w-80" align="end">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Reminders</h4>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateReminder}
              className="h-8 px-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Reminder
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {activeCount === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500 mb-4">
                No reminders set
              </div>
              <Button variant="outline" size="sm" onClick={onCreateReminder}>
                <Plus className="h-4 w-4 mr-1" />
                Add your first reminder
              </Button>
            </div>
          ) : (
            reminders
              .filter((reminder) => reminder.status !== "DELETED" && reminder.status !== "DONE")
              .map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start justify-between p-2 rounded-lg border bg-white group"
                >
                  {/* LEFT */}
                  <div>
                    <p className="font-medium text-sm">{reminder.title}</p>

                    {reminder.notes && (
                      <p className="text-xs text-gray-500">
                        {reminder.notes}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      {formatReminderDate(reminder.trigger_time)}
                    </p>
                  </div>

                  {/* RIGHT ACTIONS */}
                  <div className="flex gap-1">
                    {/* SNOOZE */}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={snoozing || reminder.status === "DONE"}
                      className=" h-8 w-8 p-0 text-yellow-600 hover:bg-yellow-50"
                      onClick={() =>
                        snoozeReminder({
                          reminderId: reminder.id,
                          snoozeUntil: 30,
                        })
                      }
                    >
                      <Clock className="h-4 w-4" />
                    </Button>

                    {/* DONE */}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={completing || reminder.status === "DONE"}
                      className=" h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                      onClick={() => doneReminder(reminder.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>

                    {/* DELETE */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className=" h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>

      </div>
    </PopoverContent>
  );
};