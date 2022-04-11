import { intervalMaching } from "./../utils/word.utils";
import { addZero } from "../utils/word.utils";
import { initAnychart } from "../utils/anychart.utils";
import { DateInterval } from "../types/services";
import { Photos } from "../db/models/photos.model";
import { getPhotos } from "../services/photoService";

async function getData(interval: DateInterval, userId: number) {
    try {
        const photos: Photos[] = await getPhotos(interval, userId);
        const chartData = [];
        for (let i = 0; i < 24; i++) {
            const photosForHour = photos.filter((photo) => photo.photoDateTime.getHours() === i);
            chartData.push([addZero(i) + ":00", photosForHour.length]);
        }
        return chartData;
    } catch (err) {
        console.error(err);
    }
}

export async function makePhotoChartPerHour(interval: DateInterval, userId: number) {
    const chartData = await getData(interval, userId);
    const [anychart, anychartExport] = initAnychart();

    const chart = anychart.column();

    chart.title(
        `Почасовой график кол-ва отправленных фотографий за ${
            Array.isArray(interval) ? "определенный промежуток времени" : intervalMaching[interval]
        }`
    );
    chart.yAxis().title("Кол-во фотографий");
    chart.xAxis().title("Время");
    chart.column(chartData);
    chart.bounds(0, 0, 1150, 760);
    chart.draw();
    return anychartExport.exportTo(chart, "jpg");
}
