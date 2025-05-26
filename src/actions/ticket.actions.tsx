'use server'
import * as Sentry from '@sentry/nextjs';


export async function createTicket(
  prevState: { success: boolean, message:string}, 
  formData: FormData
): Promise<{
    success: boolean, 
    message: string
  }> {
  console.log('FORMDATA',formData)
  const subject = formData.get('subject')?.toString() || '';
  const description = formData.get('description')?.toString() || '';
  const priority = formData.get('priority')?.toString() || 'Low';

  if(!subject || !description || !priority) {
    Sentry.captureMessage('Valid Error: Missing ticket fields')
    return { success: false, message: 'All fields are required' };
  }

  return { success: true, message: 'Ticket created successfully' };

  // // Validate input
  // if (!subject || !description) {
  //   throw new Error('Subject and description are required');
  // }

  // // Simulate ticket creation logic
  // const newTicket = {
  //   id: Date.now().toString(),
  //   subject,
  //   description,
  //   priority,
  //   status: 'Open',
  //   createdAt: new Date().toISOString(),
  // };

  // Here you would typically save the ticket to a database
  //console.log('New ticket created:', newTicket);

}