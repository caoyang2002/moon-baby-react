"use strict";
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "ping") sendResponse({ pong: true });
  return true;
});
console.log("✅ 月贝编辑器 content script 已就绪");
