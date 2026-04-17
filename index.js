const express = require('express');
const app = express();
app.use(express.json());

app.post('/alexa', async (req, res) => {
  const requestType = req.body.request?.type;

  if (requestType === 'LaunchRequest') {
    return res.json({
      version: '1.0',
      response: {
        outputSpeech: { type: 'PlainText', text: '¡Hola! ¿En qué puedo ayudarte? Podés preguntarme cualquier cosa.' },
        shouldEndSession: false
      }
    });
  }

  if (requestType === 'IntentRequest') {
    const userText = req.body.request?.intent?.slots?.query?.value || 'hola';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: userText }],
        max_tokens: 300
      })
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return res.json({
      version: '1.0',
      response: {
        outputSpeech: { type: 'PlainText', text: answer },
        shouldEndSession: false
      }
    });
  }

  res.json({
    version: '1.0',
    response: {
      outputSpeech: { type: 'PlainText', text: 'No entendí la solicitud.' },
      shouldEndSession: true
    }
  });
});

app.listen(3000);
