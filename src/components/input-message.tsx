import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type InputMessageProps = {
  input: string;
  setInput: (value: string) => void;
  sendMessage: (value: string) => void;
  placeholder: string;
};

export function InputMessage({
  input,
  setInput,
  sendMessage,
  placeholder,
}: InputMessageProps) {
  return (
    <div className="p-4 flex clear-both">
      <Input
        type="text"
        aria-label="chat input"
        required
        placeholder={placeholder}
        value={input}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage(input);
            setInput("");
          }
        }}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <Button
        type="submit"
        disabled={input.length < 2}
        className="ml-4 flex-none"
        onClick={() => {
          sendMessage(input);
          setInput("");
        }}
      >
        Ask
      </Button>
    </div>
  );
}
