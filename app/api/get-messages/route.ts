import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Message, { IMessage } from '../../../models/Message';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const messages = await Message.find({})
      .sort({ timestamp: 1 }) // Sort by timestamp ascending (oldest first)
      .lean(); // Use lean() for better performance

    return NextResponse.json({
      success: true,
      messages: messages as IMessage[],
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
