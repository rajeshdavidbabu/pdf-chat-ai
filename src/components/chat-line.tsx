import Balancer from "react-wrap-balancer";
import { Card, Collapse } from "@douyinfe/semi-ui";
import { ChatGPTMessage } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
import { sanitizeAndFormatText } from "@/lib/utils";

// util helper to convert new lines to <br /> tags
const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

export function ChatLine({
  role = "assistant",
  content,
  sources,
}: ChatGPTMessage) {
  if (!content) {
    return null;
  }
  const formattedMessage = convertNewLines(content);

  if (role === "assistant") {
    return (
      <Card
        style={{ width: "90%", marginTop: 8, borderBottomLeftRadius: 0 }}
        bodyStyle={{ padding: "12px 16px", fontSize: 13 }}
      >
        <div className="font-bold">AI</div>
        <div>{formattedMessage}</div>
        {sources ? (
          <Collapse accordion className="mt-1">
            {sources.map((source, index) => (
              <Collapse.Panel
                key={index}
                header={`Source ${index + 1}`}
                itemKey={`Source ${index + 1}`}
                style={{ fontSize: 12 }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "sans-serif",
                    textAlign: "justify",
                  }}
                >
                  {sanitizeAndFormatText(source.pageContent)}
                </div>
              </Collapse.Panel>
            ))}
          </Collapse>
        ) : null}
      </Card>
    );
  } else {
    return (
      <Card
        bordered={false}
        style={{
          marginLeft: "9%",
          width: "90%",
          marginTop: 8,
          backgroundColor: "rgba(var(--semi-grey-1), 1)",
          borderBottomRightRadius: 0,
        }}
        bodyStyle={{ padding: "12px 16px", fontSize: 13 }}
      >
        <div className="font-bold">You</div>
        <div>{formattedMessage}</div>
      </Card>
    );
  }
}
