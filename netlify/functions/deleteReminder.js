import { supabase } from './utils/supabase.js';
import nodemailer from 'nodemailer';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { lendingId, email } = JSON.parse(event.body || '');

    // Fetch the lending details for the email
    const { data: existingLending, error: fetchError } = await supabase
      .from('lendings')
      .select('borrower, amount')
      .eq('id', lendingId)
      .single();

    if (fetchError) throw fetchError;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Lending Reminder Deleted',
      text: `Your lending reminder for ${existingLending.borrower} (₹${existingLending.amount}) has been deleted.`,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Deletion notification sent successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};