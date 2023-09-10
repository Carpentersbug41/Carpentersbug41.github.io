import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { BytesOutputParser } from "langchain/schema/output_parser";
import { PromptTemplate } from "langchain/prompts";




let specialStringFound = false;
let contracting = 3;

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};
let SYSTEMMESSAGE = "";

function systemMessageFunction(){

  if(contracting === 3) {
    SYSTEMMESSAGE = SYSTEMMESSAGE2;
    contracting =3;
  }

  if(contracting === 2) {
    SYSTEMMESSAGE = SYSTEMMESSAGE5;
    contracting =3;
  }

  if(contracting === 1) {
    SYSTEMMESSAGE = SYSTEMMESSAGE4;
    contracting =2;
  }
  if(contracting === 0) {
    SYSTEMMESSAGE = SYSTEMMESSAGE3;
    contracting =1;
  }




}

const SYSTEMMESSAGE3 = `




You are a caring person-centered AI therapist who is going to talk to a client in a session.

The user is the client.



Current conversation:
{chat_history}

User: {input}
AI:`;

const SYSTEMMESSAGE5 = `

You are a caring person-centered AI therapist who is going to talk to a client in a session.








Current conversation:
{chat_history}

User: {input}
AI:`;

const SYSTEMMESSAGE2 = `You are a caring person-centered AI therapist who is going to talk to a client in a session who follows a six step plan. You always talk to the user and never say things such as " I'm really sorry that you're feeling this way, but I'm unable to provide the help that you need. "

The user is the client.




Current conversation:
{chat_history}

User: {input}
AI:`;

const SYSTEMMESSAGE1 = `

There is a variable that you must insert into the replies at various points.  The variable will take the appearance of <m(n)>, for example <m1>, m<2>, <m3> etc.



You are a caring person-centered AI therapist who is going to talk to a client in a session.  





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
  let specialStringFoundInUser = false; // Variable to hold if user's input contains <m1>
  
  try {
    systemMessageFunction();
    const body = await req.json();
    const messages = body.messages ?? [];
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    
    // Checking user's message for "<m1>"
    if (currentMessageContent.includes('<m1>')) {
      specialStringFoundInUser = true;
      // Insert your logic here if user's message contains '<m1>'
    }
    
    const prompt = PromptTemplate.fromTemplate(SYSTEMMESSAGE);
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      // modelName: "gpt-4",
      temperature: 0.0,
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
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}