"use client";

import { useState, useEffect, useCallback } from "react";
import { ContactMessage } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { contactMessagesAPI } from "@/lib/api";
import { FaEnvelope, FaPhone, FaUser, FaCalendarAlt, FaCheck, FaClock, FaExclamationTriangle } from "react-icons/fa";

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const fetchMessages = useCallback(async (resetPagination = false) => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = {
        limit: 20,
        offset: resetPagination ? 0 : pagination.offset,
      };

      const response = await contactMessagesAPI.getContactMessages(params);

      if (response.success && response.data) {
        setMessages(response.data.messages);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch contact messages');
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      setError('Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  }, [pagination.offset]);

  useEffect(() => {
    fetchMessages(true); // Initial load
  }, []);

  useEffect(() => {
    if (pagination.offset > 0) {
      fetchMessages(false); // Load more messages
    }
  }, [pagination.offset]);

  const openMessageModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const updateMessageStatus = async (messageId: string, newStatus: string, notes?: string) => {
    setUpdating(true);
    try {
      const response = await contactMessagesAPI.updateContactMessage(messageId, {
        status: newStatus as "new" | "in_progress" | "resolved",
        notes: notes || "",
      });

      if (response.success) {
        // Refresh the messages list
        await fetchMessages(false);
        closeMessageModal();
      } else {
        setError('Failed to update message status');
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      setError('Failed to update message status');
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadMore = () => {
    setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <FaExclamationTriangle className="h-4 w-4 text-red-400" />;
      case 'in_progress':
        return <FaClock className="h-4 w-4 text-yellow-400" />;
      case 'resolved':
        return <FaCheck className="h-4 w-4 text-green-400" />;
      default:
        return <FaEnvelope className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Contact Messages</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => fetchMessages(true)} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
          <p className="text-gray-400">Manage customer inquiries and support requests</p>
        </div>

        {/* Message Count */}
        <div className="mb-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400">
                Showing {messages.length} of {pagination.total} messages
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group"
              onClick={() => openMessageModal(message)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors duration-200">
                    {message.firstName} {message.lastName}
                  </CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(message.status)}`}>
                    {getStatusIcon(message.status)}
                    {message.status.replace('_', ' ')}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FaEnvelope className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-300 truncate">{message.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaPhone className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-300">{message.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaCalendarAlt className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-300">{formatDate(message.createdAt)}</span>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {message.message}
                  </p>
                </div>

                {/* User Status */}
                {message.userId && (
                  <div className="flex items-center gap-2 text-xs">
                    <FaUser className="h-3 w-3 text-blue-400" />
                    <span className="text-blue-400">Registered User</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Contact Messages</h3>
            <p className="text-gray-400">No contact messages have been submitted yet.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.hasMore && (
          <div className="mt-8 text-center">
            <Button 
              onClick={handleLoadMore}
              variant="outline"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Load More Messages
            </Button>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedMessage.firstName} {selectedMessage.lastName}
                  </h2>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getStatusColor(selectedMessage.status)}`}>
                    {getStatusIcon(selectedMessage.status)}
                    {selectedMessage.status.replace('_', ' ')}
                  </div>
                </div>
                <Button 
                  onClick={closeMessageModal}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              {/* Contact Information */}
              <Card className="bg-gray-800/50 border-gray-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{selectedMessage.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{selectedMessage.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{formatDate(selectedMessage.createdAt)}</span>
                  </div>
                  {selectedMessage.userId && (
                    <div className="flex items-center gap-3">
                      <FaUser className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400">Registered User</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message Content */}
              <Card className="bg-gray-800/50 border-gray-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              {selectedMessage.notes && (
                <Card className="bg-gray-800/50 border-gray-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Admin Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                      <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedMessage.status === 'new' && (
                  <Button 
                    onClick={() => updateMessageStatus(selectedMessage.id, 'in_progress', 'Started investigating the issue')}
                    disabled={updating}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <FaClock className="h-4 w-4 mr-2" />
                    Mark as In Progress
                  </Button>
                )}
                {selectedMessage.status === 'in_progress' && (
                  <Button 
                    onClick={() => updateMessageStatus(selectedMessage.id, 'resolved', 'Issue has been resolved')}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <FaCheck className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
                <Button 
                  onClick={closeMessageModal}
                  variant="outline"
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
