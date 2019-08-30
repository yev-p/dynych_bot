const uuid = require('uuid/v4');
const models = require('../models');
const constants = require('../constants');

const enhanceReminder = (reminder) => ({
    ...reminder,
    id: uuid(),
    date: Number(reminder.date),
});

const validate = (reminder) => {
    if (!reminder.text || typeof reminder.text !== 'string') {
        throw new Error('text: Текст напоминания обязателен');
    }
    if (!reminder.date) {
        throw new Error('date: Дата не указана');
    }

    const date = Number(reminder.date);
    if (isNaN(date) || date.toString().length !== 13) {
        throw new Error('date: Неправильная дата');
    }
    let now = Date.now();
    now = now - now % constants.ms.minute;
    if (now > date) {
        throw new Error('date: Дата уже прошла');
    }
};

const insertReminder = (reminders, reminder) => {
    let index = reminders.findIndex(({ date }) => date > reminder.date);
    if (index === -1) {
        index = reminders.length;
    }

    const copy = reminders.slice();
    copy.splice(index, 0, reminder);
    return copy;
};

const removeReminder = (reminders, reminder) => reminders.filter(({ id }) => id !== reminder.id);

const sendReminderAfterTimeout = (reminder, sendReminder, chatId) => {
    let offset = Number(reminder.date) - Date.now();
    if (offset < 0) {
        offset = 0;
    }

    setTimeout(async () => {
        await sendReminder(chatId, reminder.text);
        const chat = await models.Chat.scope('reminder').findByPk(chatId);
        if (!chat) {
            return;
        }

        const oldReminders = chat.get('reminders');
        const reminders = removeReminder(oldReminders, reminder);
        await chat.update({ reminders });
    }, offset);
};

const saveReminder = async ({ chatId, ...reminder }, sendReminder) => {
    if (isNaN(Number(chatId))) {
        throw new Error(`Неправильный формат ID чата – "${chatId}"`);
    }
    const chat = await models.Chat.scope('reminder').findByPk(chatId);
    if (!chat) {
        throw new Error(`Чат с указанным ID не существует – "${chatId}"`);
    }

    validate(reminder);
    const enhancedReminder = enhanceReminder(reminder);
    const oldReminders = chat.get('reminders');
    const reminders = insertReminder(oldReminders, enhancedReminder);
    await chat.update({ reminders });

    if (reminder.date < Date.now() + constants.ms.hour) {
        sendReminderAfterTimeout(enhancedReminder, sendReminder, chatId);
    }

    return {
        ...enhancedReminder,
        chatId,
    };
};

const setReminders = async (sendReminder) => {
    const now = Date.now();
    const chats = await models.Chat.scope('reminder').findAll({ raw: true });

    chats.forEach((chat) => {
        chat.reminders
            .filter((reminder) => reminder.date < now + constants.ms.hour)
            .forEach((reminder) => sendReminderAfterTimeout(reminder, sendReminder, chat.id));
    });

    setTimeout(() => setReminders(sendReminder), constants.ms.hour);
};

module.exports = {
    saveReminder,
    setReminders,
};
