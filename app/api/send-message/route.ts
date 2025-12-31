import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Message from '../../../models/Message';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { sender, content } = await request.json();

    if (!sender || !content) {
      return NextResponse.json(
        { success: false, error: 'Sender and content are required' },
        { status: 400 }
      );
    }

    const message = new Message({
      sender: sender.trim(),
      content: content.trim(),
    });

    await message.save();

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
