"use client";

import React, { Component } from "react";

import {
  PdfLoader,
  AreaHighlight,
  Popup
} from "react-pdf-highlighter";
import { Highlight } from "./components/Highlight";
import Tip from "./components/Tip";

import type { IHighlight, NewHighlight } from "react-pdf-highlighter";

import { Sidebar } from "./Sidebar";
import { Spinner } from "./Spinner";
import { testHighlights as _testHighlights } from "./test-highlights";

import "./style/App.css";
import { PdfHighlighter } from "./components/PdfHighlighter";

import { PdfContext } from "./page";

const testHighlights: Record<string, Array<IHighlight>> = _testHighlights;

interface State {
  url: string;
  highlights: Array<IHighlight>;
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

class PdfDisplayer extends Component<{}, State> {
  state = {
    url: initialUrl,
    highlights: testHighlights[initialUrl]
      ? [...testHighlights[initialUrl]]
      : [],
  };

  resetHighlights = () => {
    this.setState({
      highlights: [],
    });
  };

  deleteHighlight = (id: string) => {
    const highlightsCopy = [...this.state.highlights];
    this.setState({
      highlights: highlightsCopy.filter(i => i.id !== id),
    })
  }

  handleOpenFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    this.setState({
      url: url,
      highlights: testHighlights[url] ? [...testHighlights[url]] : [],
    });
    const key = file.name.replace(/[^a-zA-Z0-9]/g, '');
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
    const { highlights } = this.state;

    return highlights.find((highlight) => highlight.id === id);
  }

  addHighlight(highlight: NewHighlight) {
    const { highlights } = this.state;

    console.log("Saving highlight", highlight);

    this.setState({
      highlights: [{ ...highlight, id: getNextId() }, ...highlights],
    });
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.setState({
      highlights: this.state.highlights.map((h) => {
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
      }),
    });
  }

  render() {
    const { url, highlights } = this.state;

    return (
      <div className="App" style={{ display: "flex", height: "100%" }}>
        <Sidebar
          highlights={highlights}
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
                      this.addHighlight({ content, position, comment });

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
