import { getTicketById } from "@/actions/ticket.actions";
import { logEvent } from "@/utils/sentry";
import { notFound, redirect } from "next/navigation";
import { getPriorityClass } from "@/utils/getPriorityClass";
import Link from "next/link";
import CloseTicketButton from "@/components/CloseTicketButton";
import { getCurrentUser } from "@/lib/current-user";

type TicketDetailsPageProps ={
  params: Promise<{id: string }>
}

const TicketDetailsPage = async ( props: TicketDetailsPageProps) => {
  
  const { id } = await props.params
  const ticket = await getTicketById(id);

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (!ticket) {
    notFound();
  }
  logEvent(
    `Viewing ticket details: ${ticket.id}`,
    'ticket',
    { ticketId: ticket.id },
    'info'
  );

  return (
    <div className='min-h-screen bg-blue-50 p-8'>
      <div className='max-w-2xl mx-auto bg-white rounded-lg shadow border border-gray-200 p-8 space-y-6'>
        <h1 className='text-3xl font-bold text-blue-600'>{ticket.subject}</h1>

        <div className='text-gray-700'>
          <h2 className='text-lg font-semibold mb-2'>Description</h2>
          <p>{ticket.description}</p>
        </div>

        <div className='text-gray-700'>
          <h2 className='text-lg font-semibold mb-2'>Priority</h2>
          <p className={getPriorityClass(ticket.priority)}>{ticket.priority}</p>
        </div>

        <div className='text-gray-700'>
          <h2 className='text-lg font-semibold mb-2'>Created At</h2>
          <p>{new Date(ticket.createdAt).toLocaleString()}</p>
        </div>

        <Link
          href='/tickets'
          className='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'
        >
          ← Back to Tickets
        </Link>
        {
          ticket.status !== 'Close' && (
            <CloseTicketButton 
              ticketId={ticket.id} 
              isClosed={ticket.status === 'Closed'} 
            />
          )
        }

      </div>
    </div>
  );
}

export default TicketDetailsPage;