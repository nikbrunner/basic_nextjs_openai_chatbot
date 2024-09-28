import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from "openai";

const client = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { messages } = req.body;

            const response = await client.chat.completions.create({
                model: "gpt-4",
                messages,
                max_tokens: 500,
                temperature: 0,
            });


            if (response?.choices[0].message?.content) {
                res.status(200).json({ messages: response.choices[0].message.content.trim() });
            } else {
                res.status(500).json({ error: 'No response from OpenAI' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error processing your request' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
