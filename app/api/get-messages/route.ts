import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Message, { IMessage } from '../../../models/Message';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch messages with error handling
    const messages = await Message.find({})
      .sort({ timestamp: 1 }) // Sort by timestamp ascending (oldest first)
      .lean() // Use lean() for better performance
      .limit(100); // Limit to prevent excessive data transfer

    // Transform messages to ensure proper serialization
    const serializedMessages = messages.map(msg => ({
      _id: msg._id.toString(),
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      messages: serializedMessages,
      count: serializedMessages.length,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json({
          success: false,
          error: 'Database connection failed. Please try again later.',
          messages: []
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages',
      messages: []
    }, { status: 500 });
  }

}