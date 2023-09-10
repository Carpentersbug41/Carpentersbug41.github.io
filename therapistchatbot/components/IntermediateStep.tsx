import { useState } from "react";
import type { Message } from "ai/react";
import type { AgentStep } from "langchain/schema";

export function IntermediateStep(props: { message: Message }) {
  const parsedInput: AgentStep = JSON.parse(props.message.content);
  const action = parsedInput.action;
  const observation = parsedInput.observation;
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex">
      <ChatWindow
        endpoint="api/chat/chat_route1"
        emoji="🏴‍☠️"
        titleText="Patchy the Chatty Pirate"
        placeholder="I'm an LLM pretending to be a therapist"
        emptyStateComponent={InfoCard}
        defaultValue={sharedInput}
        onInputChange={handleInput}
      />

      <ChatWindow
        endpoint="api/chat/chat_route2"
        emoji="🏴‍☠️"
        titleText="Another Chatty Pirate"
        placeholder="I'm an LLM receiving input from first window"
        defaultValue={sharedInput}
      />
    </div>
  );
}