import 'dotenv/config';
import { schedule } from '@netlify/functions';
import nodemailer from 'nodemailer';
const { supabase } = require('./utils/supabase');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Schedule the function to run daily at midnight
export const handler = schedule('0 0 * * *', async (event) => {
  const { data: lendings, error } = await supabase.from('lendings').select('*');

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }

  const now = new Date();
  const processedReminders = [];

  for (const lending of lendings) {
    // Verify the lending still exists and is active
    const { data: currentLending, error: verifyError } = await supabase
      .from('lendings')
      .select('*')
      .eq('id', lending.id)
      .single();

    if (verifyError || !currentLending) {
      console.log(`Lending ${lending.id} no longer exists, skipping...`);
      continue;
    }

    // Use the most up-to-date reminder frequency
    const reminderDate = new Date(currentLending.date);
    const reminderFrequency = currentLending.reminderfrequency;

    if (reminderFrequency === 'daily') {
      reminderDate.setDate(reminderDate.getDate() + 1);
    } else if (reminderFrequency === 'weekly') {
      reminderDate.setDate(reminderDate.getDate() + 7);
    } else if (reminderFrequency === 'monthly') {
      reminderDate.setMonth(reminderDate.getMonth() + 1);
    } else if (reminderFrequency === 'yearly') {
      reminderDate.setFullYear(reminderDate.getFullYear() + 1);
    }

    if (now >= reminderDate) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: currentLending.user_email,
        subject: 'Lending Reminder',
        text: `Reminder to ask ${currentLending.borrower} for payback of ₹${currentLending.amount}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        
        // Update the next reminder date
        await supabase
          .from('lendings')
          .update({ 
            date: reminderDate.toISOString(),
            last_reminded: now.toISOString()
          })
          .eq('id', currentLending.id);

        processedReminders.push(currentLending.id);
      } catch (error) {
        console.error(`Failed to send email to ${currentLending.user_email}: ${error.message}`);
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Periodic reminders processed successfully' }),
  };
});