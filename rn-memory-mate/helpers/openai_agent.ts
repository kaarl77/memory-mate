import { supabase } from '@/helpers/supabase'
import OpenAI from 'openai'
import { z } from 'zod'
import { IMessage } from 'react-native-gifted-chat'
import { zodResponseFormat } from 'openai/helpers/zod'

const reminderAgentPrompt = `The following is a conversation between a user and an agent. The agent will atempt to extract a reminder from the user's message. If a reminder cannot be extracted, or the user changes the subject, the agent will reject the response by setting the reminder object as a string with the content REJECTED. The date right now is ${new Date().toDateString()}.`

export const CalendarEvent = {}

export const CalendarReminder = z.object({
  reminder: z.union(
    [
      z.string().describe('Response type can be: ***REJECTED or Reminder***'),
      z.object({
        title: z.string().optional(),
        startDate: z.string().optional(),
        notes: z.string().optional(),
        dueDate: z.string().optional()
      }).describe('Reminder object'),
      z.object({}).describe('Event object')
    ]
  )
})

export async function getOpenAIAgent() {
  const { data, error } = await supabase
    .from('credentials')
    .select('value')
    .eq('key', 'OPENAI_API_KEY')
    .limit(1)
    .single()

  if (error) {
    throw new Error('Failed to fetch OpenAI API key')
  }

  if (data?.value) {
    return new OpenAI({ apiKey: data.value })
  }

  throw new Error('OpenAI API key not found')
}

export async function getCalendarReminderFromMessage(agent?: OpenAI, message?: IMessage, extraPrompt?: string) {
  if (!agent || !message) {
    return
  }

  const response = await agent.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `${reminderAgentPrompt} ${extraPrompt}`
      },
      {
        role: 'user',
        content: message.text
      }
    ],
    response_format: zodResponseFormat(CalendarReminder, 'reminder'),
    n: 1,
    max_completion_tokens: 200
  })

  return response.choices[0].message.parsed
}