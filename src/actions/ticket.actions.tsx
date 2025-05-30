'use server'
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { logEvent } from '@/utils/sentry';

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
      logEvent(
        'Validation Error: Missing ticket fields',
          'ticket', 
          { subject, description, priority },
          'warning'
      )
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

    logEvent(
      `Ticket created successfully ${ticket.id}`,
      'ticket',
      { ticketId: ticket.id },
      'info'
    );
    //to update page ticket list
    revalidatePath('/tickets');

    return { success: true, message: 'Ticket created successfully' };

  } catch (error) {
    logEvent(
      'Error occurred while creating',
      'ticket',
      { 
        formData: Object.fromEntries(formData.entries()),
        },
      'error',
      error
    );
    return { success: false, message: 'An error occurred while creating the the ticket' };
  }
}

export async function getTickets() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    logEvent(
      `Fetched ${tickets.length} tickets successfully`,
      'ticket',
      { count: tickets.length },
      'info'
    );

    return tickets;
    
  } catch (error) {
    logEvent(
      'Error occurred while fetching tickets',
      'ticket',
      {},
      'error',
      error
    );
    return [];
  }
}