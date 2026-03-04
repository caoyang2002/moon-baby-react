import { useEffect } from "react";
import { useStore } from "@/store";
import TopNav from "@/components/shared/TopNav";
import Sidebar from "@/components/shared/Sidebar";
import Toast from "@/components/shared/Toast";
import ArticlePane from "@/components/article/ArticlePane";
import GraphicPane from "@/components/graphic/GraphicPane";
import ImagePane from "@/components/image/ImagePane";
import GifPane from "@/components/gif/GifPane";
import H5Pane from "@/components/h5/H5Pane";
import SettingsPane from "@/components/settings/SettingsPane";

// Default sidebar items per tab
const DEFAULT_SIDE: Record<string, string> = {
  article:  "history",
  graphic:  "zoom",
  image:    "adjust",
  gif:      "anim",
  h5:       "elements",
  settings: "general",
};

export default function App() {
  const { state, act } = useStore();

  // Reset sidebar item when tab changes
  useEffect(() => {
    act.setSide(DEFAULT_SIDE[state.activeTab] ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeTab]);

  const handleDebug  = () => window.__ybDebug?.();
  const handleReload = () => window.__ybReload?.();

  const tab = state.activeTab;

  return (
    <>
      <TopNav onDebug={handleDebug} onReload={handleReload} />

      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          {tab === "article"  && <ArticlePane />}
          {tab === "graphic"  && <GraphicPane />}
          {tab === "image"    && <ImagePane />}
          {tab === "gif"      && <GifPane />}
          {tab === "h5"       && <H5Pane />}
          {tab === "settings" && <SettingsPane />}
        </div>
      </div>

      <Toast />
    </>
  );
}
