import { intervalMaching } from "./../utils/word.utils";
import { addZero } from "../utils/word.utils";
import { initAnychart } from "../utils/anychart.utils";
import { DateInterval } from "../types/services";
import { Messages } from "../db/models/messages.model";
import { getMessages } from "../services/messagesService";

async function getData(interval: DateInterval, userId: number) {
    try {
        const messages: Messages[] = await getMessages(interval, userId);

        const chartData = [];
        for (let i = 0; i < 24; i++) {
            const messagesForHour = messages.filter((message) => message.messageDateTime.getHours() === i);
            chartData.push([addZero(i) + ":00", messagesForHour.length]);
        }
        return chartData;
    } catch (err) {
        console.error(err);
    }
}

export async function makeMessagesChartPerHour(interval: DateInterval, userId: number) {
    const chartData = await getData(interval, userId);
    const [anychart, anychartExport] = initAnychart();

    const chart = anychart.column();

    chart.title(
        `Почасовой график кол-ва отправленных сообщений за ${
            Array.isArray(interval) ? "определенный промежуток времени" : intervalMaching[interval]
        }`
    );
    chart.yAxis().title("Кол-во сообщений");
    chart.xAxis().title("Время");
    chart.column(chartData);
    chart.bounds(0, 0, 1150, 760);
    chart.draw();
    return anychartExport.exportTo(chart, "jpg");
}
