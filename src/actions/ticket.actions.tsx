'use server'
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';


export async function createTicket(
  prevState: { success: boolean, message:string}, 
  formData: FormData
): Promise<{
    success: boolean, 
    message: string
  }> {

    try {
      //throw new Error('Simulated error Prisma for testing');
      const subject = formData.get('subject')?.toString() || '';
      const description = formData.get('description')?.toString() || '';
      const priority = formData.get('priority')?.toString() || 'Low';

      if(!subject || !description || !priority) {
        Sentry.captureMessage('Valid Error: Missing ticket fields', 'warning')
        return { success: false, message: 'All fields are required' };
      }

      // create ticket
      const ticket = await prisma.ticket.create({
        data: {
          subject,
          description,
          priority
        }
      });

      Sentry.addBreadcrumb({
        category: 'ticket',
        message: `Ticket created with ID: ${ticket.id}`,
        level: 'info'
      })

      Sentry.captureMessage(`Ticket created with ID: ${ticket.id}`);

      revalidatePath('/tickets');

      return { success: true, message: 'Ticket created successfully' };

    } catch (error) {
      Sentry.captureException(error as Error, {
        extra: {
          formData: Object.fromEntries(formData.entries()),
        }
      });
      return { success: false, message: 'An error occurred while creating the the ticket' };
    }


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