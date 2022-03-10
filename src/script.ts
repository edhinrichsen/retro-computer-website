import "./style.css";
import WebGL from "./webgl";

WebGL();

const root = document.documentElement;
root.dataset.scroll = window.scrollY as any;
window.addEventListener("scroll", (ev) => {
    root.dataset.scroll = window.scrollY as any;

},{passive: true});
