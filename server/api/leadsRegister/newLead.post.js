import { EmailClient } from "@azure/communication-email";
import { createClient } from '@supabase/supabase-js';

async function sendEmail(body){

  // This code demonstrates how to fetch your connection string
  // from an environment variable.
  const emailClient = new EmailClient(process.env.NUXT_PUBLIC_COMMUNICATION_SERVICES_CONNECTION_STRING);  
  const POLLER_WAIT_TIME = 10
  try {
    const message = {
      senderAddress: "101@warocol.com",
      content: {
        subject: "Welcome to Azure Communication Services Email",
        plainText: "This email message is sent from Azure Communication Services Email using the JavaScript SDK.",
      },
      recipients: {
        to: [
          {
            address: body.email,
          },
        ],
      },
    };

    const poller = await emailClient.beginSend(message);

    if (!poller.getOperationState().isStarted) {
      throw "Poller was not started."
    }else{
      return { data: 'email sended' }
    }

    
  } catch (e) {
    console.log(e)
  }


}

export default defineEventHandler(async (event) => {

  const body = await readBody(event)
  const supabase = createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
      const { data, error } = await supabase
      .from('leads')
      .insert([
        { email: body.email, campaign: body.campaign },
      ])
      .select()
    if (data) {
      const response = await sendEmail(body)
      return data
    }
  } catch (error) {
    return error
  }
});
