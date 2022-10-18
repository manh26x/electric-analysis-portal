import React, { useEffect, useState, useRef } from "react";
import {
    Excalidraw,
    exportToCanvas,
    exportToSvg,
    exportToBlob, loadSceneOrLibraryFromBlob, MIME_TYPES, parseLibraryTokensFromUrl, newElementWith
} from "@excalidraw/excalidraw";
import InitialData from "./initialData";

import "./App.scss";
import type {ExcalidrawElement, InitializedExcalidrawImageElement} from "@excalidraw/excalidraw/types/element/types";
import {
    AppState, BinaryFileData,
    ExcalidrawImperativeAPI,
    ExcalidrawProps,
    LibraryItems
} from "@excalidraw/excalidraw/types/types";
import ExampleSidebar from "./sidebar/ExampleSidebar";
import {ImportedLibraryData} from "@excalidraw/excalidraw/types/data/types";
export const isInitializedImageElement = (
    element: ExcalidrawElement | null,
): element is InitializedExcalidrawImageElement => {
    return !!element && element.type === "image" && !!element.fileId;
};

import {EVENT} from "@excalidraw/excalidraw/types/constants";

const libExcalidraw = ['./electrical-engineering.excalidrawlib']

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
        loadLibrary();
        updateScene();
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
        if(!excalidrawRef) {
            return;
        }
        fetch('./saved.excalidraw').then(res => res.blob())
            .then(async file => {
                // @ts-ignore
                const contents = await loadSceneOrLibraryFromBlob(file, null, null);
                excalidrawRef.current!.updateScene(contents.data as any);
                const  data : any = contents.data;
                const fileList = data.files;

                if(fileList) {
                    const binaryFileList: BinaryFileData[] = [];
                    Object.keys(fileList).forEach(key =>{
                        binaryFileList.push(fileList[key].dataURL)
                    })
                    excalidrawRef.current!.addFiles(binaryFileList);
                    const params = excalidrawRef.current;
                    params!.updateScene({
                        elements: params!
                            .getSceneElementsIncludingDeleted()
                            .map((element) => {
                                if (isInitializedImageElement(element) ) {
                                    // @ts-ignore
                                    return newElementWith(element, {status: "error",});
                                }
                                return element;
                            }),
                    });
                }
            });
    };
    const loadLibrary = async () => {
        let libList: any[] =[]
      fetch('./electrical-engineering.excalidrawlib')
          .then(res => res.blob())
          .then(async (file: any) => {
            const contents = await loadSceneOrLibraryFromBlob(file, null, null);
              libList = libList.concat((contents.data as ImportedLibraryData).libraryItems!)
          }).then(() => fetch('./library-personal.excalidrawlib'))
          .then(res => res.blob())
          .then(async (file: any) => {
              const contents = await loadSceneOrLibraryFromBlob(file, null, null);
              libList = libList.concat((contents.data as ImportedLibraryData).libraryItems!);
              console.log(libList)
              excalidrawRef.current!.updateLibrary({
                  libraryItems: libList,
                  openLibraryMenu: true,
              });
          });;
  };
  return (
      <div className="App">
        <ExampleSidebar>
        <h1> Excalidraw Example</h1>
        <div className="button-wrapper">
          <button className="update-scene" onClick={updateScene}>
            Update Scene
          </button>
          <button onClick={loadLibrary}>Load Scene or Library</button>
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
              // onChange={(elements: readonly ExcalidrawElement[], state: AppState) =>
              //     console.log("Elements :", elements, "State : ", state)
              // }
              // onPointerUpdate={(payload) => console.log(payload)}
              // onCollabButtonClick={() =>
              //     window.alert("You clicked on collab button")
              // }
              viewModeEnabled={viewModeEnabled}
              zenModeEnabled={zenModeEnabled}
              gridModeEnabled={gridModeEnabled}
              theme={theme}
              name="Custom name of drawing"
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
                    ...InitialData.appState,
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
                    ...InitialData.appState,
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
                    ...InitialData.appState,
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
