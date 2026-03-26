import { assistProject, evaluateProjectShort } from './aiAssistant.js';

export async function assistWithAi(payload) {
  return assistProject(payload);
}

export async function evaluateWithAi(payload) {
  return evaluateProjectShort(payload);
}

