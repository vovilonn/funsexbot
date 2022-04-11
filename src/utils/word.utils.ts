export function addZero(num: number): string {
    return num >= 10 ? String(num) : "0" + num;
}

export const intervalMaching = {
    hour: "час",
    day: "день",
    week: "неделю",
    month: "месяц",
};
