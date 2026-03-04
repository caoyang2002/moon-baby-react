"use strict";
chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log(reason === "install" ? "✅ 月贝编辑器已安装" : "✅ 月贝编辑器已更新");
});
