/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Handles both document shapes:
 *   1. Flat wa_bot_flows document  (flow_type === "wabot", trigger_event,
 *      welcome_message at root)
 *   2. Old automation_flows doc with WaBot data nested inside flow_data
 */
export function isWaBotFlow(flowData: any): boolean {
  if (!flowData) return false;

  // Shape 1 — flat WaBot fields at root (wa_bot_flows collection)
  if (flowData.flow_type === "wabot") return true;
  if (flowData.trigger_type === "whatsapp_message_received") return true;
  if (flowData.trigger_event === "message_received") return true;
  if (flowData.welcome_message) return true;

  // Shape 2 — nested inside flow_data (old automation_flows, pre-migration)
  const fd = flowData.flow_data;
  if (fd?.trigger_event === "message_received") return true;
  if (fd?.welcome_message) return true;
  if (fd?.trigger_type === "whatsapp_message_received") return true;

  return false;
}