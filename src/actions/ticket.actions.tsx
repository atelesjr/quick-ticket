'use server'
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { logEvent } from '@/utils/sentry';
import { getCurrentUser } from '@/lib/current-user';

export async function createTicket(
  prevState: { success: boolean, message:string}, 
  formData: FormData
): Promise<{
    success: boolean, 
    message: string
  }> {

  try {
    const user = await getCurrentUser();
    if (!user) {
      logEvent(
        'Unauthorized ticket creation attempt',
        'ticket',
        {},
        'warning'
      );
      return { success: false, message: 'User not authenticated' };
    };
    
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
        priority,
        user:{
          connect: { id: user.id }
        }
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
    const user = await getCurrentUser();
    if (!user) {
      logEvent(
        'Unauthorized ticket retrieval attempt',
        'ticket',
        {},
        'warning'
      );
      return [];
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id},
      orderBy: { createdAt: 'desc'}
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

export async function getTicketById(ticketId: string) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: +ticketId }
    });

    if (!ticket) {
      logEvent(
        `Ticket not found with ID: ${ticketId}`,
        'ticket',
        { ticketId },
        'warning'
      );
      return null;
    }

    // logEvent(
    //   `Fetched ticket successfully with ID: ${ticket.id}`,
    //   'ticket',
    //   { ticketId: ticket.id },
    //   'info'
    // );

    return ticket;

  } catch (error) {
    logEvent(
      'Error occurred while fetching ticket by ID',
      'ticket',
      { ticketId },
      'error',
      error
    );
    return null;
  }
}

// Close Ticket
export async function closeTicket(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const ticketId = Number(formData.get('ticketId'));

  if (!ticketId) {
    logEvent('Missing ticket ID', 'ticket', {}, 'warning');
    return { success: false, message: 'Ticket ID is Required' };
  }

  const user = await getCurrentUser();

  if (!user) {
    logEvent('Missing user ID', 'ticket', {}, 'warning');

    return { success: false, message: 'Unauthorized' };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket || ticket.userId !== user.id) {
    logEvent(
      'Unauthorized ticket close attempt',
      'ticket',
      { ticketId, userId: user.id },
      'warning'
    );

    return {
      success: false,
      message: 'You are not authorized to close this ticket',
    };
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'Closed' },
  });

  revalidatePath('/tickets');
  revalidatePath(`/tickets/${ticketId}`);

  return { success: true, message: 'Ticket closed successfully' };
}