import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Message from '../../../models/Message';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await request.json();
    const { sender, content } = body;

    // Validate input
    if (!sender || !content) {
      return NextResponse.json(
        { success: false, error: 'Sender and content are required' },
        { status: 400 }
      );
    }

    // Validate input types and length
    if (typeof sender !== 'string' || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Sender and content must be strings' },
        { status: 400 }
      );
    }

    if (sender.trim().length === 0 || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sender and content cannot be empty' },
        { status: 400 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Message content too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Create and save message
    const message = new Message({
      sender: sender.trim(),
      content: content.trim(),
    });

    const savedMessage = await message.save();

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: savedMessage._id,
        timestamp: savedMessage.timestamp
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);

    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json({
          success: false,
          error: 'Database connection failed. Please try again later.'
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
