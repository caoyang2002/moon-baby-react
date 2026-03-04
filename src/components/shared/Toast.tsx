import { useState, useEffect, useCallback, useRef } from "react";

let _show: ((msg: string) => void) | null = null;
export function toast(msg: string) { _show?.(msg); }


// 存储 show 函数的引用
let showToastFn: ((msg: string) => void) | null = null;

// 导出调用函数
export const showToast = (msg: string) => {
  showToastFn?.(msg);
};

// 默认导出组件
export default function Toast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((m: string) => {
    setMsg(m);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => {
      showToastFn = null;
    };
  }, [show]);

  return <div className={`toast${visible ? " on" : ""}`}>{msg}</div>;
}

