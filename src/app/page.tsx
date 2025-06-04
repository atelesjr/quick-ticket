import { getCurrentUser } from "@/lib/current-user";
import Link from "next/link";

import { FaTicketAlt } from "react-icons/fa";
//import { FaTicket } from "react-icons/fa6";

const  Home = async () =>{
  const user = await getCurrentUser();
  
  return (
    <main className="flex flex-col text-center items-center justify-center min-h-screen p-4">
      <FaTicketAlt className="mx-auto mb-4 text-red-600" size={60} />
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600">
        Welcome to Quick Tickets
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Fast and simple support ticket management.system
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center animate-slide opacity-0">
        <Link 
          href={ user ? "/tickets/new" : "/login" }
          className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition">
          {/* <FaTicket className="mr-2" /> */}
          Submit a Ticket
        </Link>
        <Link 
          href={ user ?"/tickets" : "/login" }
          className="bg-blue-100 text-gray-700 px-6 py-3 rounded shadow hover:bg-blue-200 transition">
          {/* <FaTicket className="mr-2" /> */}
            View Tickets
        </Link>
      </div>
    </main>
  );
}

export default Home;
