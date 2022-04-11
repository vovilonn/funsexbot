import { IDesirePossibility, IMessageSession } from "./src/types/services";
import TelegramBot from "node-telegram-bot-api";
import config from "./config.json";
import tunnel from "tunnel-ssh";
import messages from "./src/messages.json";
import fs from "fs";
import keyboards from "./src/keyboards.json";
import { deleteSession, getSession, pushSession, validateSession } from "./src/services/messageSessions";
import { getReceiverId } from "./src/utils/message.utils";
import { sequelize } from "./src/db";
import { Desires } from "./src/db/models/desires.model";
import { checkDesirePossibility, getDesiresCount } from "./src/services/desiresService";
import { makeSexChartPerHour } from "./src/charts/sex.chart";
import { Messages } from "./src/db/models/messages.model";
import { Photos } from "./src/db/models/photos.model";
import { makePhotoChartPerHour } from "./src/charts/photo.chart";
import { makeMessagesChartPerHour } from "./src/charts/messages.chart";
import { fn } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const bot: TelegramBot = new TelegramBot(config.TOKEN, { polling: true, filepath: false });

process.env.TZ = "Europe/Kiev";

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, messages.start, {
        reply_markup: { inline_keyboard: keyboards.start, resize_keyboard: true },
    });
});

// send photo action

bot.onText(/^отправить писичку/i, (msg) => {
    bot.sendMessage(msg.chat.id, messages.sendPhoto[0]);
});

bot.on("photo", async (msg) => {
    await bot.sendMessage(msg.from.id, messages.sendPhoto[1], {
        reply_markup: { inline_keyboard: keyboards.skipPhotoDescription },
    });
    pushSession(msg.from.id, "photoDescription", { fileId: msg.photo[0].file_id });
});

//send message action

bot.onText(/^отправить сообщение/i, async (msg) => {
    if (getSession(msg.from.id)?.type === "sendMessage") {
        return;
    }
    await bot.sendMessage(msg.chat.id, messages.sendMessage[0]);
    pushSession(msg.from.id, "sendMessage");
});

// send sex desire action

bot.onText(/^хочу трахатся/i, async (msg) => {
    try {
        const desire: IDesirePossibility = await checkDesirePossibility(msg.from.id);
        if (desire.isPossible) {
            const receiverId = getReceiverId(msg.from.id);
            await Desires.create({ userId: msg.from.id, desireDateTime: fn("NOW") });
            const desiresCount = await getDesiresCount("day", msg.from.id);
            const feedbackMsg =
                messages.desireSexSended[desiresCount >= 10 ? 3 : desiresCount >= 5 ? 2 : desiresCount >= 1 ? 1 : 0];
            bot.sendMessage(receiverId, messages.desireSexReceiver[0]);
            return bot.sendMessage(msg.chat.id, `${feedbackMsg}\n\nВсего раз за день: ${desiresCount}`);
        }
        const minsDiff = Math.ceil(desire.diff / 1000 / 60);
        bot.sendMessage(msg.chat.id, `${messages.desireSexTimeout} ${minsDiff} мин`);
    } catch (err) {
        bot.sendMessage(msg.chat.id, messages.error);
        console.error(err);
    }
});

// statictics

bot.onText(/^статистика/i, (msg) => {
    bot.sendMessage(msg.chat.id, messages.statistics[0], {
        reply_markup: { keyboard: keyboards.statistics.common, resize_keyboard: true },
    });
});

bot.onText(/^трахания/i, async (msg) => {
    try {
        bot.sendMessage(msg.chat.id, "Посмотреть статистику трахания за:", {
            reply_markup: { inline_keyboard: keyboards.statistics.sex.interval },
        });
    } catch (err) {
        bot.sendMessage(msg.chat.id, messages.error);
        console.error(err);
    }
});

bot.onText(/^фото/i, async (msg) => {
    try {
        bot.sendMessage(msg.chat.id, "Посмотреть статистику фото за:", {
            reply_markup: { inline_keyboard: keyboards.statistics.photo.interval },
        });
    } catch (err) {
        bot.sendMessage(msg.chat.id, messages.error);
        console.error(err);
    }
});

bot.onText(/^сообщений/i, async (msg) => {
    try {
        bot.sendMessage(msg.chat.id, "Посмотреть статистику сообщений за:", {
            reply_markup: { inline_keyboard: keyboards.statistics.messages.interval },
        });
    } catch (err) {
        bot.sendMessage(msg.chat.id, messages.error);
        console.error(err);
    }
});

bot.onText(/^⬅️ Назад/i, (msg) => {
    bot.sendMessage(msg.chat.id, messages.chooseElse, {
        reply_markup: { keyboard: keyboards.common, resize_keyboard: true },
    });
});

bot.onText(/./i, async (msg) => {
    if (msg.from.id !== +process.env.FEMALE_USER_ID && msg.from.id !== +process.env.MALE_USER_ID) {
        return bot.sendMessage(msg.chat.id, messages.forbidden);
    }
    // if (msg.reply_to_message) {
    //     console.log(msg.reply_to_message);
    // }
    const receiverId = getReceiverId(msg.from.id);
    const session: IMessageSession = getSession(msg.from.id);

    try {
        if (session?.type === "photoDescription") {
            await bot.sendPhoto(receiverId, session.details.fileId, {
                caption: `${messages.photoReceiver}\n\n${msg.text}`,
            });
            bot.sendMessage(msg.chat.id, messages.sendPhoto[2]);
            deleteSession(msg.from.id);
            return Photos.create({ userId: msg.from.id, photoDateTime: fn("NOW") });
        }
        if (session?.type === "sendMessage") {
            await bot.sendMessage(receiverId, `${messages.messageReceiver}\n\n${msg.text}`);
            bot.sendMessage(msg.chat.id, messages.sendMessage[1]);
            deleteSession(msg.from.id);
            return Messages.create({ userId: msg.from.id, messageDateTime: fn("NOW") });
        }
    } catch (err) {
        bot.sendMessage(msg.chat.id, messages.error);
        console.error(err);
    }
});

bot.on("callback_query", async (qr) => {
    const chatId = qr.message.chat.id;
    try {
        if (qr.data === "start") {
            return bot.sendMessage(chatId, messages.education[0], {
                reply_markup: {
                    keyboard: keyboards.common,
                    resize_keyboard: true,
                },
            });
        }

        if (qr.data === "photoDescription/skip") {
            const receiverId = getReceiverId(qr.from.id);
            const session: IMessageSession = validateSession(qr.from.id, "photoDescription");
            await bot.sendPhoto(receiverId, session.details.fileId, { caption: messages.photoReceiver });
            bot.sendMessage(qr.message.chat.id, messages.sendPhoto[2]);
            deleteSession(qr.from.id);
            return Photos.create({ userId: qr.from.id, photoDateTime: fn("NOW") });
        }

        // sex statistics

        if (qr.data === "statistics/sex/day") {
            const photo = await makeSexChartPerHour("day", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }

        if (qr.data === "statistics/sex/week") {
            const photo = await makeSexChartPerHour("week", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }

        if (qr.data === "statistics/sex/month") {
            const photo = await makeSexChartPerHour("month", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }

        // photo statistics

        if (qr.data === "statistics/photo/day") {
            const photo = await makeSexChartPerHour("day", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }

        if (qr.data === "statistics/photo/week") {
            const photo = await makePhotoChartPerHour("week", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }

        if (qr.data === "statistics/photo/month") {
            const photo = await makePhotoChartPerHour("month", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }

        // messages statistics

        if (qr.data === "statistics/messages/day") {
            const photo = await makeMessagesChartPerHour("day", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }

        if (qr.data === "statistics/messages/week") {
            const photo = await makeMessagesChartPerHour("week", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }

        if (qr.data === "statistics/messages/month") {
            const photo = await makeMessagesChartPerHour("month", qr.from.id);
            return bot.sendPhoto(qr.message.chat.id, photo);
        }
    } catch (err) {
        bot.sendMessage(qr.message.chat.id, messages.error);
        console.error(err);
    }
});

// DB INIT

async function sequelizeInit() {
    sequelize
        .authenticate()
        .then(async function () {
            console.log("connection established");
        })
        .catch(function (err) {
            console.error("unable establish connection", err);
        });
    return sequelize;
}

if (process.env.SSH) {
    tunnel(
        {
            ...config.sshConfig,
            privateKey: fs.readFileSync("./ssh_key.pem"),
        },
        function (error) {
            if (error) {
                console.error(error);
            } else {
                sequelizeInit();
            }
        }
    );
} else {
    sequelizeInit();
}
