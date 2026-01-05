import { useEffect, useState } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Download, RefreshCw, X } from "lucide-react";

export default function Updater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateObj, setUpdateObj] = useState<Update | null>(null);
  const [version, setVersion] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "downloading" | "ready">(
    "idle"
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update?.available) {
          setUpdateObj(update);
          setVersion(update.version);
          setBody(update.body || "");
          setUpdateAvailable(true);
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    checkForUpdates();
  }, []);

  const handleUpdate = async () => {
    if (!updateObj) return;

    setStatus("downloading");
    try {
      let downloaded = 0;
      let contentLength = 0;

      await updateObj.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength || 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case "Finished":
            setStatus("ready");
            break;
        }
      });

      await relaunch();
    } catch (error) {
      console.error("Update failed:", error);
      setStatus("idle");
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <RefreshCw size={18} className="text-blue-500" />
            发现新版本 v{version}
          </h3>
          {status === "idle" && (
            <button
              onClick={() => setUpdateAvailable(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6">
          <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap mb-4 max-h-60 overflow-y-auto">
            {body}
          </p>

          {status === "downloading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>下载中...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100">
          {status === "idle" ? (
            <>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="px-4 py-2 rounded text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors border border-gray-200 bg-white shadow-sm"
              >
                稍后提醒
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 shadow-sm transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                立即更新
              </button>
            </>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded text-sm font-medium text-white bg-blue-400 cursor-not-allowed shadow-sm flex items-center gap-2"
            >
              <RefreshCw size={16} className="animate-spin" />
              正在更新...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
