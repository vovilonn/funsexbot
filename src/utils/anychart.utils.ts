import { JSDOM } from "jsdom";
const Anychart = require("anychart");
const AnychartExport = require("anychart-nodejs");

export function initAnychart() {
    const { window } = new JSDOM("<!doctype html><html><body></body></html>");
    const anychart = Anychart(window);
    const anychartExport = AnychartExport(anychart);
    return [anychart, anychartExport];
}
