"use client";

import React, { Component } from "react";

import {
  PdfLoader,
  AreaHighlight,
  Popup
} from "react-pdf-highlighter";
import { Highlight } from "./components/Highlight";
import Tip from "./components/Tip";

// import type { IHighlight, NewHighlight } from "react-pdf-highlighter";

import { Sidebar } from "./Sidebar";
import { Spinner } from "./Spinner";
import { testHighlights as _testHighlights } from "./test-highlights";

import "./style/App.css";
import { PdfHighlighter } from "./components/PdfHighlighter";
import { PdfContext } from "./page";
import { IHighlight, NewHighlight } from "./types/types";

const testHighlights: Record<string, Array<IHighlight>> = _testHighlights;

interface State {
  url: string;
}

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

// https://arxiv.org/pdf/1708.08021.pdf
const PRIMARY_PDF_URL = "https://arxiv.org/pdf/1708.08021.pdf";
// const PRIMARY_PDF_URL = "file:///Users/bytedance/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480.pdf";

const searchParams = new URLSearchParams(document.location.search);

const initialUrl = searchParams.get("url") || PRIMARY_PDF_URL;

class PdfDisplayer extends Component<{
  highlights: IHighlight[],
  setHighlights: React.Dispatch<React.SetStateAction<IHighlight[]>>,
  setSelectedHighlight: React.Dispatch<React.SetStateAction<IHighlight | undefined>>,
  addHighlight?: ((highlight: NewHighlight) => void) | undefined,
}, State> {
  state = {
    url: initialUrl,
  };

  deleteHighlight = (id: string) => {
    const highlightsCopy = [...this.props.highlights];
    this.props.setHighlights(highlightsCopy.filter(i => i.id !== id));
  }

  handleOpenFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    this.setState({
      url: url,
    });
    const key = file.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      console.log("resp", response);
    } catch (err) {
      console.log(err);
    }
  };

  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
  }

  getHighlightById(id: string) {
    const { highlights } = this.props;

    return highlights.find((highlight) => highlight.id === id);
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.props.setHighlights(this.props.highlights.map((h) => {
      const {
        id,
        position: originalPosition,
        content: originalContent,
        ...rest
      } = h;
      return id === highlightId
        ? {
            id,
            position: { ...originalPosition, ...position },
            content: { ...originalContent, ...content },
            ...rest,
          }
        : h;
    }));
  }

  render() {
    const { url } = this.state;
    const { highlights, setHighlights, setSelectedHighlight } = this.props;

    return (
      <div className="App" style={{ display: "flex", height: "100%" }}>
        <Sidebar
          highlights={highlights.filter(h => h.isSaved) || []}
          deleteHighlight={this.deleteHighlight}
          onFileOpen={this.handleOpenFile}
        />
        <div
          style={{
            height: "100%",
            width: '60vw',
            position: "relative",
          }}
        >
          <PdfLoader url={url} beforeLoad={<Spinner />}>
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                pdfScaleValue="auto"
                scrollRef={(scrollTo) => {
                  this.scrollViewerTo = scrollTo;

                  this.scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      const tempHighlight = { content, position, comment };
                      this.props.addHighlight?.(tempHighlight);
                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image
                  );

                  const component = isTextHighlight ? (
                    <Highlight
                      highlight={highlight}
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
                  ) : (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo}
                      highlight={highlight}
                      onChange={(boundingRect) => {
                        this.updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) }
                        );
                      }}
                    />
                  );

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={(popupContent) =>
                        setTip(highlight, (highlight) => popupContent)
                      }
                      onMouseOut={hideTip}
                      key={index}
                    >
                      {component}
                    </Popup>
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>
      </div>
    );
  }
}

export default PdfDisplayer;
