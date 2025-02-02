
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const isCodeRelatedQuery = (query: string): boolean => {
  const codeKeywords = [
    'code',
    'function',
    'bug',
    'error',
    'fix',
    'debug',
    'implement',
    'programming',
    'syntax',
    'correct'
  ];
  return codeKeywords.some(keyword =>
    query.toLowerCase().includes(keyword)
  );
};

interface GeminiResponse {
  content: string;
  isCode: boolean;
}

export class GeminiService {
  private async getCodeResponse(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const codePrompt = `
      You are a coding assistant. Please help with the following code-related query.
      Only provide code as response, with minimal necessary comments.
      If there are multiple solutions, provide the most efficient one.
      Query: ${prompt}
    `;

    const result = await model.generateContent(codePrompt);
    const response = await result.response;
    return response.text();
  }

  private async getTextResponse(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const textPrompt = `
      You are a helpful assistant. Please provide a clear and concise response to the following query.
      Keep the response informative but conversational.
      Query: ${prompt}
    `;

    const result = await model.generateContent(textPrompt);
    const response = await result.response;
    return response.text();
  }

  public async getResponse(prompt: string): Promise<GeminiResponse> {
    try {
      const isCode = isCodeRelatedQuery(prompt);
      const content = isCode
        ? await this.getCodeResponse(prompt)
        : await this.getTextResponse(prompt);

      return {
        content,
        isCode
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }
}