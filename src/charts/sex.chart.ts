import { Desires } from "./../db/models/desires.model";
import { addZero, intervalMaching } from "../utils/word.utils";
import { getDesires } from "../services/desiresService";
import { initAnychart } from "../utils/anychart.utils";
import { DateInterval } from "../types/services";

async function getData(interval: DateInterval, userId: number) {
    try {
        const desires: Desires[] = await getDesires(interval, userId);

        const chartData = [];
        for (let i = 0; i < 24; i++) {
            const desiresForHour = desires.filter((desire) => desire.desireDateTime.getHours() === i);
            chartData.push([addZero(i) + ":00", desiresForHour.length]);
        }
        return chartData;
    } catch (err) {
        console.error(err);
    }
}

export async function makeSexChartPerHour(interval: DateInterval, userId: number) {
    const chartData = await getData(interval, userId);
    const [anychart, anychartExport] = initAnychart();

    const chart = anychart.column();

    chart.title(
        `Почасовой график желаний потрахатся за ${
            Array.isArray(interval) ? "определенный промежуток времени" : intervalMaching[interval]
        }`
    );
    chart.yAxis().title("Кол-во желаний");
    chart.xAxis().title("Время");
    chart.column(chartData);
    chart.bounds(0, 0, 1150, 760);
    chart.draw();
    return anychartExport.exportTo(chart, "jpg");
}
