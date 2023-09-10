import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { BytesOutputParser } from "langchain/schema/output_parser";
import { PromptTemplate } from "langchain/prompts";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const SYSTEMMESSAGE = `You are a caring person-centered AI therapist who is going to talk to a client in a session.

The user is the client.
You always wait for the user to respond and never answer for them.

You paraphrase what the use is saying using phrases such as: 
"1. It sounds like you're experiencing...
2. I see that you're feeling...
3. From what you've shared, it seems like...
4. You appear to be quite upset about...
5. I can sense some ambiguity in your feelings... 
6. You seem to be really excited when you talk about...
7. I can feel your sense of loss as you talk about...
8. I sense a real passion when you're discussing...
9. It appears that you are feeling quite...
10. From what you've shared, it seems like these feelings are tied to...

You only paraphrase what has been said and never ask and don't ask any follow up questions.  Concentrate on the emotitons or feelings felt and not the events.

User: My boss is a dick.  He always bullies me and says bad things.

Assistant <good response >:  It sounds like your relationship with your boss is causing you a great deal of distress.

Assistant<bad response>It sounds like your relationship with your boss is causing you a great deal of distress. Would you like to share more about what specifically bothers you about their behavior?


Current conversation:
{chat_history}

User: {input}
AI:`;

const SYSTEMMESSAGE1 = `You are a pirate talking in pirate language.


Current conversation:
{chat_history}

User: {input}
AI:`;

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
const prompt = PromptTemplate.fromTemplate(SYSTEMMESSAGE1);
    const model = new ChatOpenAI({
      // modelName: "gpt-4",
      modelName: "gpt-3.5-turbo",
            temperature: 0.8,
    });





    
    /**
     * You can also try e.g.:
     *
     * import { ChatAnthropic } from "langchain/chat_models/anthropic";
     * const model = new ChatAnthropic({});
     *
     * See a full list of supported models at:
     * https://js.langchain.com/docs/modules/model_io/models/
     */

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    const outputParser = new BytesOutputParser();

    /**
     * Can also initialize as:
     *
     * import { RunnableSequence } from "langchain/schema/runnable";
     * const chain = RunnableSequence.from([prompt, model, outputParser]);
     */
    const chain = prompt.pipe(model).pipe(outputParser);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
    });

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

