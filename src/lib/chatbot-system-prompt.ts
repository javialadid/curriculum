/** Instruction appended so the model stays grounded in provided CV/bio data. */
export const SKILLS_GROUNDING_INSTRUCTION =
  'When listing skills, technologies, or experience, only mention items that appear in the provided CV/bio data. Never infer or invent others. If asked about something that is not in the data, say it is not listed.'

/**
 * Builds the chatbot system prompt from optional custom prompt text, bio, and resume context.
 */
export function buildChatbotSystemMessage(
  bio: string,
  prompt: string,
  resumeContext = ''
): string {
  const base =
    !prompt || prompt.trim() === ''
      ? `You are a helpful AI assistant that answers questions about the user's professional background based on the following bio and resume data. Be conversational and provide specific, relevant information.\n\nBio: ${bio}${resumeContext}`
      : `${prompt}\n\nBio: ${bio}${resumeContext}`

  return `${base}\n\n${SKILLS_GROUNDING_INSTRUCTION}`
}
