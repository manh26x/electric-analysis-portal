import React, { useEffect, useState, useRef } from "react";
import {
  Excalidraw,
  exportToCanvas,
  exportToSvg,
  exportToBlob
} from "@excalidraw/excalidraw";
import InitialData from "./initialData";

import "./App.css";
import initialData from "./initialData";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState,
  ExcalidrawImperativeAPI,
  ExcalidrawProps
} from "@excalidraw/excalidraw/types/types";
import ExampleSidebar from "./sidebar/ExampleSidebar";

const renderTopRightUI = () => {
  return (
      <button onClick={() => alert("This is dummy top right UI")}>
        {" "}
        Click me{" "}
      </button>
  );
};

const renderFooter = () => {
  return (
      <button onClick={() => alert("This is dummy footer")}>
        {" "}
        custom footer{" "}
      </button>
  );
};

export default function App() {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);

  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [exportWithDarkMode, setExportWithDarkMode] = useState<boolean>(false);
  const [shouldAddWatermark, setShouldAddWatermark] = useState<boolean>(false);
  const [theme, setTheme] = useState<ExcalidrawProps["theme"]>("light");

  useEffect(() => {
    const onHashChange = () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const libraryUrl = hash.get("addLibrary");
      if (libraryUrl) {
        // @ts-ignore
        excalidrawRef.current!.updateLibrary(libraryUrl, hash.get("token"));
      }
    };
    window.addEventListener("hashchange", onHashChange, false);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const updateScene = () => {
    const sceneData = {
      elements: [
        {
          type: "rectangle",
          version: 141,
          versionNonce: 361174001,
          isDeleted: false,
          id: "oDVXy8D6rom3H1-LLH2-f",
          fillStyle: "hachure",
          strokeWidth: 1,
          strokeStyle: "solid",
          roughness: 1,
          opacity: 100,
          angle: 0,
          x: 100.50390625,
          y: 93.67578125,
          strokeColor: "#c92a2a",
          backgroundColor: "transparent",
          width: 186.47265625,
          height: 141.9765625,
          seed: 1968410350,
          groupIds: []
        }
      ],
      appState: {
        viewBackgroundColor: "#fff"
      }
    };
    // @ts-ignore
    excalidrawRef.current!.updateScene(sceneData);
  };

  return (
      <div className="App">
        <ExampleSidebar>
        <h1> Excalidraw Example</h1>
        <div className="button-wrapper">
          <button className="update-scene" onClick={updateScene}>
            Update Scene
          </button>
          <button
              className="reset-scene"
              onClick={() => {
                excalidrawRef.current!.resetScene();

              }}
          >
            Reset Scene
          </button>
          <label>
            <input
                type="checkbox"
                checked={viewModeEnabled}
                onChange={() => setViewModeEnabled(!viewModeEnabled)}
            />
            View mode
          </label>
          <label>
            <input
                type="checkbox"
                checked={zenModeEnabled}
                onChange={() => setZenModeEnabled(!zenModeEnabled)}
            />
            Zen mode
          </label>
          <label>
            <input
                type="checkbox"
                checked={gridModeEnabled}
                onChange={() => setGridModeEnabled(!gridModeEnabled)}
            />
            Grid mode
          </label>
          <label>
            <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={() => {
                  let newTheme: "light" | "dark" = "light";
                  if (theme === "light") {
                    newTheme = "dark";
                  }
                  setTheme(newTheme);
                }}
            />
            Switch to Dark Theme
          </label>
        </div>
        <div className="excalidraw-wrapper">
          <Excalidraw
              ref={excalidrawRef}
              initialData={InitialData}
              onChange={(elements: readonly ExcalidrawElement[], state: AppState) =>
                  console.log("Elements :", elements, "State : ", state)
              }

              onPointerUpdate={(payload) => console.log(payload)}
              onCollabButtonClick={() =>
                  window.alert("You clicked on collab button")
              }
              viewModeEnabled={viewModeEnabled}
              zenModeEnabled={zenModeEnabled}
              gridModeEnabled={gridModeEnabled}
              theme={theme}
              name="Custom name of drawing"
              renderFooter={renderFooter}
              renderTopRightUI={renderTopRightUI}
          />
        </div>
        <div className="export-wrapper button-wrapper">
          <label className="export-wrapper__checkbox">
            <input
                type="checkbox"
                checked={exportWithDarkMode}
                onChange={() => setExportWithDarkMode(!exportWithDarkMode)}
            />
            Export with dark mode
          </label>
          <label className="export-wrapper__checkbox">
            <input
                type="checkbox"
                checked={shouldAddWatermark}
                onChange={() => setShouldAddWatermark(!shouldAddWatermark)}
            />
            Add Watermark
          </label>
          <button
              onClick={async () => {
                const svg = await exportToSvg({
                  exportPadding: undefined, files: null, maxWidthOrHeight: 0,
                  elements: excalidrawRef.current!.getSceneElements(),
                  appState: {
                    ...initialData.appState,
                    exportWithDarkMode
                  }
                });
                document.querySelector(".export-svg")!.innerHTML = svg.outerHTML;
              }}
          >
            Export to SVG
          </button>
          <div className="export export-svg"></div>

          <button
              onClick={async () => {
                const blob = await exportToBlob({
                  elements: excalidrawRef.current!.getSceneElements(),
                  mimeType: "image/png",
                  appState: {
                    ...initialData.appState,
                    exportWithDarkMode
                  },
                  files: null
                });
                setBlobUrl(window.URL.createObjectURL(blob));
              }}
          >
            Export to Blob
          </button>
          <div className="export export-blob">
            <img src={blobUrl!} alt="" />
          </div>

          <button
              onClick={async () => {
                const canvas = await exportToCanvas({
                  elements: excalidrawRef.current!.getSceneElements(),
                  appState: {
                    ...initialData.appState,
                    exportWithDarkMode
                  },
                  files: null
                });
                setCanvasUrl(canvas.toDataURL());
              }}
          >
            Export to Canvas
          </button>
          <div className="export export-canvas">
            <img src={canvasUrl!} alt="" />
          </div>
        </div>
        </ExampleSidebar>
      </div>
  );
}
