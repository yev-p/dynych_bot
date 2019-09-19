const DB_NAME = 'notes';
const DB_VERSION = 1;
const DB_SCHEMAS = {
    NOTES: 'notes',
    PREFERENCES: 'preferences',
};
let db;
let actionTypes;
let preferencesKeys;
const createDatabase = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => reject(new Error(e.target.error));
    request.onsuccess = (e) => {
        db = e.target.result;
        resolve();
    };
    request.onupgradeneeded = (e) => {
        const database = e.target.result;

        const presentSchemaNames = Array.from(database.objectStoreNames);
        Object.values(DB_SCHEMAS).forEach((schemaName) => {
            if (presentSchemaNames.includes(schemaName)) {
                database.deleteObjectStore(schemaName);
            }
        });

        const notes = database.createObjectStore(DB_SCHEMAS.NOTES, { keyPath: 'id' });
        notes.createIndex('id', 'id', { unique: true });
        notes.createIndex('text', 'text');
        notes.createIndex('timestamp', 'timestamp');

        const preferences = database.createObjectStore(DB_SCHEMAS.PREFERENCES, { keyPath: 'key' });
        preferences.createIndex('key', 'key', { unique: true });
        preferences.add({
            key: preferencesKeys.IS_DARK_MODE,
            value: false,
        });
        preferences.add({
            key: preferencesKeys.IS_KEYBOARD_SHOWN,
            value: true,
        });
    };
});
const loadJsonFile = async (fileName) => {
    const url = `/notes/${fileName}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Server responded with a "${response.status}" status when trying to fetch "${url}"`);
    }
    return response.json();
};
const handleApiInstall = async () => {
    try {
        await Promise.all([
            (async () => {
                actionTypes = await loadJsonFile('actionTypes.json');
            })(),
            (async () => {
                preferencesKeys = await loadJsonFile('preferencesKeys.json');
            })(),
        ]);
    } catch (err) {
        throw new Error(`Failed to load necessary files for service worker API – ${err.message}`);
    }

    try {
        await createDatabase();
    } catch (err) {
        throw new Error(`Failed to initiate a database for service worker API – ${err.message}`);
    }
};
const getPreferences = () => new Promise((resolve, reject) => {
    let data;
    const transaction = db.transaction([DB_SCHEMAS.PREFERENCES]);
    transaction.onerror = (e) => reject(new Error(e.target.error));
    transaction.oncomplete = (e) => resolve(data);

    const preferences = transaction.objectStore(DB_SCHEMAS.PREFERENCES);
    const request = preferences.getAll();
    request.onsuccess = (e) => {
        data = e.target.result.reduce((acc, curr) => ({
            ...acc,
            [curr.key]: curr.value,
        }), {});
    };
});
const setPreference = (preference) => new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_SCHEMAS.PREFERENCES], 'readwrite');
    transaction.onerror = (e) => reject(new Error(e.target.error));
    transaction.oncomplete = (e) => resolve(preference.value);

    const preferences = transaction.objectStore(DB_SCHEMAS.PREFERENCES);
    preferences.put(preference);
});
const getNotes = () => new Promise((resolve, reject) => {
    let data;
    const transaction = db.transaction([DB_SCHEMAS.NOTES]);
    transaction.onerror = (e) => reject(new Error(e.target.error));
    transaction.oncomplete = (e) => resolve(data);

    const notes = transaction.objectStore(DB_SCHEMAS.NOTES);
    const indexedNotes = notes.index('timestamp');
    const request = indexedNotes.getAll();
    request.onsuccess = (e) => {
        data = request.result.slice().reverse();
    };
});
const saveNote = (note) => new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_SCHEMAS.NOTES], 'readwrite');
    transaction.onerror = (e) => reject(new Error(e.target.error));
    transaction.oncomplete = (e) => resolve(note);

    const notes = transaction.objectStore(DB_SCHEMAS.NOTES);
    notes.add(note);
});
const deleteNote = (id) => new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_SCHEMAS.NOTES], 'readwrite');
    transaction.onerror = (e) => reject(new Error(e.target.error));
    transaction.oncomplete = (e) => resolve(id);

    const notes = transaction.objectStore(DB_SCHEMAS.NOTES);
    notes.delete(id);
});
const handleApiMessage = async (client, data) => {
    let response = { ok: true };

    switch (data.action) {
        case actionTypes.GET_PREFERENCES:
            response.data = await getPreferences();
            break;
        case actionTypes.SET_PREFERENCE:
            response.data = await setPreference(data.data);
            break;
        case actionTypes.GET_NOTES:
            response.data = await getNotes();
            break;
        case actionTypes.SAVE_NOTE:
            response.data = await saveNote(data.data);
            break;
        case actionTypes.DELETE_NOTE:
            response.data = await deleteNote(data.data);
            break;
        default:
            response = {
                ok: false,
                error: {
                    message: `Unknown action – "${data.action}"`,
                },
            };
    }

    client.postMessage(response);
};

self.addEventListener('install', (e) => {
    e.waitUntil(handleApiInstall());
});
self.addEventListener('message', (e) => {
    e.waitUntil(handleApiMessage(e.ports[0], e.data));
});