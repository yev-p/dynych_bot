const util = require('./utilService');
const emojis = require('../emojis');
const collections = {
    movingEmojis: {
        RED_HEART: emojis.RED_HEART,
        THUMBS_UP: emojis.THUMBS_UP,
        UNAMUSED_FACE: emojis.UNAMUSED_FACE,
        FLUSHED_FACE: emojis.FLUSHED_FACE,
        PARTYING_FACE: emojis.PARTYING_FACE,
    },
    facepalmEmojis: {
        PERSON_FACEPALMING: emojis.PERSON_FACEPALMING,
        PERSON_FACEPALMING_LIGHT_SKIN_TONE: emojis.PERSON_FACEPALMING_LIGHT_SKIN_TONE,
        PERSON_FACEPALMING_MEDIUM_LIGHT_SKIN_TONE: emojis.PERSON_FACEPALMING_MEDIUM_LIGHT_SKIN_TONE,
        PERSON_FACEPALMING_MEDIUM_SKIN_TONE: emojis.PERSON_FACEPALMING_MEDIUM_SKIN_TONE,
        PERSON_FACEPALMING_MEDIUM_DARK_SKIN_TONE: emojis.PERSON_FACEPALMING_MEDIUM_DARK_SKIN_TONE,
        PERSON_FACEPALMING_DARK_SKIN_TONE: emojis.PERSON_FACEPALMING_DARK_SKIN_TONE,
        MAN_FACEPALMING: emojis.MAN_FACEPALMING,
        MAN_FACEPALMING_LIGHT_SKIN_TONE: emojis.MAN_FACEPALMING_LIGHT_SKIN_TONE,
        MAN_FACEPALMING_MEDIUM_LIGHT_SKIN_TONE: emojis.MAN_FACEPALMING_MEDIUM_LIGHT_SKIN_TONE,
        MAN_FACEPALMING_MEDIUM_SKIN_TONE: emojis.MAN_FACEPALMING_MEDIUM_SKIN_TONE,
        MAN_FACEPALMING_MEDIUM_DARK_SKIN_TONE: emojis.MAN_FACEPALMING_MEDIUM_DARK_SKIN_TONE,
        MAN_FACEPALMING_DARK_SKIN_TONE: emojis.MAN_FACEPALMING_DARK_SKIN_TONE,
        WOMAN_FACEPALMING: emojis.WOMAN_FACEPALMING,
        WOMAN_FACEPALMING_LIGHT_SKIN_TONE: emojis.WOMAN_FACEPALMING_LIGHT_SKIN_TONE,
        WOMAN_FACEPALMING_MEDIUM_LIGHT_SKIN_TONE: emojis.WOMAN_FACEPALMING_MEDIUM_LIGHT_SKIN_TONE,
        WOMAN_FACEPALMING_MEDIUM_SKIN_TONE: emojis.WOMAN_FACEPALMING_MEDIUM_SKIN_TONE,
        WOMAN_FACEPALMING_MEDIUM_DARK_SKIN_TONE: emojis.WOMAN_FACEPALMING_MEDIUM_DARK_SKIN_TONE,
        WOMAN_FACEPALMING_DARK_SKIN_TONE: emojis.WOMAN_FACEPALMING_DARK_SKIN_TONE,
    },
};

const getRandomEmoji = (collection = emojis) => util.getRandomArrayItem(Object.values(collection));

module.exports = {
    emojis,
    ...collections,
    getRandomEmoji,
};
