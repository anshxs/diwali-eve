'use client';

import { useState, useEffect } from 'react';
import { getTicketsFromLocalStorage } from '@/lib/utils';
import { Registration } from '@/lib/supabase';
import { Ticket, Calendar, Users, Phone, Mail, Copy, CheckCircle } from 'lucide-react';

export default function MyTickets() {
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const savedTickets = getTicketsFromLocalStorage();
    setTickets(savedTickets);
  }, []);

  const copyTicketId = async (ticketId: string) => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopiedId(ticketId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Tickets Found</h2>
          <p className="text-gray-500">You haven't registered for any events yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tickets</h1>
          <p className="text-gray-600">Diwali Night 2025 - All your registrations</p>
        </div>

        <div className="grid gap-6">
          {tickets.map((ticket, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden border">
              {/* Ticket Header */}
              <div className="text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Diwali Night 2025</h3>
                    <p className="opacity-90">Shree Garden, Roorkee</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>16th Oct, 6 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-6">
                {/* Ticket ID */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Ticket ID</p>
                      <p className="text-md font-bold text-orange-600">{ticket.ticket_id}</p>
                    </div>
                    <button
                      onClick={() => copyTicketId(ticket.ticket_id)}
                      className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      {copiedId === ticket.ticket_id ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary Registrant */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Primary Registrant</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {ticket.name}</p>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{ticket.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{ticket.phone}</span>
                      </div>
                      <p><span className="font-medium">Date of Birth:</span> {new Date(ticket.date_of_birth).toLocaleDateString()}</p>
                      <p><span className="font-medium">Emergency Contact:</span> {ticket.parent_husband_mobile}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5" />
                      <h4 className="font-semibold text-lg">Registration Type</h4>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="font-medium text-blue-800">
                        {ticket.registration_type === 'SINGLE' ? 'Single Pass' : 'Group Pass'}
                      </p>
                      {ticket.registration_type === 'GROUP' && ticket.group_members && (
                        <p className="text-sm text-blue-600">
                          {ticket.group_members.length + 1} people
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Group Members */}
                {ticket.registration_type === 'GROUP' && ticket.group_members && ticket.group_members.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Group Members</h4>
                    <div className="grid gap-4">
                      {ticket.group_members.map((member, memberIndex) => (
                        <div key={memberIndex} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium mb-2">Member {memberIndex + 1}</h5>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <p><span className="font-medium">Name:</span> {member.name}</p>
                            <p><span className="font-medium">DOB:</span> {new Date(member.date_of_birth).toLocaleDateString()}</p>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-500" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registration Date */}
                {ticket.created_at && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Registered on: {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Ticket Footer */}
              <div className="bg-yellow-50 border-t border-yellow-200 p-4">
                <p className="text-yellow-800 text-sm text-center">
                  <strong>Note:</strong> Please carry a valid ID and this ticket ID for entry. 
                  Payment verification is in progress.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl  p-6 mt-8">
          <h3 className="text-xl font-bold mb-4 text-center">Important Instructions</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">What to Bring:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Valid Government ID</li>
                <li>• This Ticket ID (screenshot recommended)</li>
                <li>• Traditional outfit (dress code)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Event Guidelines:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Entry starts at 6:00 PM</li>
                <li>• No outside food or drinks</li>
                <li>• Follow COVID protocols if any</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}