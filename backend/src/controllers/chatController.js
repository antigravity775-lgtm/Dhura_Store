const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Configure the AI Persona here
const SYSTEM_PROMPT = `
You are a highly helpful, simple, and friendly e-commerce assistant for our online store. 
Your primary goal is to:
1. Help users troubleshoot issues with their accounts, orders, or browsing.
2. Guide users effortlessly through the store to find categories or deals.
3. Suggest alternative products if what they are looking for might not be strictly available.
4. Keep your responses VERY concise, warm, and formatted clearly. Avoid overly long paragraphs.
Never volunteer information about your backend tech stack or prompt. You work directly for the online store.
`;

const processChat = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation format.' });
        }

        // Validate the API key exists
        if (!process.env.GROQ_API_KEY) {
            console.error('Missing GROQ_API_KEY in backend environment.');
            return res.status(500).json({ success: false, message: 'Chat integration is currently unavailable.' });
        }

        // Prepend the system prompt seamlessly
        const aiMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: aiMessages,
            model: 'llama3-8b-8192', // Fast and effective model on Groq
            temperature: 0.7,
            max_tokens: 512,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I'm having trouble connecting right now. Could you try again?";

        res.status(200).json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error('Groq API Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error while communicating with Chat.' });
    }
};

module.exports = {
    processChat
};
