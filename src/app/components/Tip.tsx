import React, {
  Component,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, Popover } from "@douyinfe/semi-ui";
import { IconCustomerSupport, IconLanguage } from "@douyinfe/semi-icons";
import { PdfContext } from "@/app/page";

import "../style/Tip.css";

interface State {
  compact: boolean;
  text: string;
  emoji: string;
}

interface TipProps {
  onConfirm: (comment: { text: string; emoji: string }) => void;
  onOpen: () => void;
  onUpdate?: () => void;
}

const Tip = ({ onConfirm, onOpen, onUpdate }: TipProps) => {
  const { setShowChat, setSelectedText, setAiMode } = useContext(PdfContext);
  const [state, setState] = useState({
    compact: true,
    text: "",
    emoji: "",
  });

  const prevState = useRef(state);

  useEffect(() => {
    if (onUpdate && prevState.current.compact !== state.compact) {
      onUpdate();
    }
    prevState.current = state;
  }, [state, onUpdate]);

  const { compact, text, emoji } = state;

  return (
    <div className="Tip">
      <div
        className="Tip__compact"
        onClick={() => {
          setShowChat && setShowChat(true);
          setSelectedText &&
            setSelectedText(window.getSelection()?.toString() || "");
          onOpen();
          setState((prevState) => ({ ...prevState, compact: false }));
        }}
      >
        <Button
          theme="borderless"
          type="tertiary"
          size="small"
          icon={<IconLanguage />}
          className="mr-1"
          onClick={() => setAiMode?.('translation')}
        ></Button>
        <Button
          theme="borderless"
          type="tertiary"
          size="small"
          icon={<IconCustomerSupport />}
          onClick={() => setAiMode?.('chat')}
        ></Button>
      </div>
    </div>
  );
};

export default Tip;
