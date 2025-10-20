import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const CONFIG_PATH = path.join(ROOT, 'config', 'social_credentials.json');
const LOGS_DIR = path.join(ROOT, 'logs', 'imperial', 'operations');

const TRACE_PREFIX = 'CREDENCIALES_RED_SOCIAL';

function ensureLogsDir() {
    if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
}

function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        throw new Error(`No se encontró el archivo de configuración en ${CONFIG_PATH}.`);
    }
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
}

function scheduleRenewal(entryName, expirationIso, daysBefore = 7) {
    if (!expirationIso || expirationIso === 'TO_FILL') {
        return null;
    }
    const expiration = new Date(expirationIso);
    if (Number.isNaN(expiration.getTime())) {
        return null;
    }
    const msBefore = daysBefore * 24 * 60 * 60 * 1000;
    const renewalDate = new Date(expiration.getTime() - msBefore);
    return {
        entry: entryName,
        expiration: expiration.toISOString(),
        renewal_suggested: renewalDate.toISOString(),
        days_before: daysBefore
    };
}

function collectSchedules(config) {
    const schedules = [];

    const facebook = config.facebook || {};
    for (const [pageKey, pageData] of Object.entries(facebook)) {
        const schedule = scheduleRenewal(`facebook:${pageKey}`, pageData.token_expiration, 7);
        if (schedule) {
            schedules.push(schedule);
        }
    }

    const instagram = config.instagram || {};
    for (const [key, account] of Object.entries(instagram)) {
        const schedule = scheduleRenewal(`instagram:${key}`, account.token_expiration, 7);
        if (schedule) {
            schedules.push(schedule);
        }
        (account.agents || []).forEach(agent => {
            const agentSchedule = scheduleRenewal(`instagram:${key}:agent:${agent.agent_code}`, agent.token_expiracion, 7);
            if (agentSchedule) {
                schedules.push(agentSchedule);
            }
        });
    }

    const whatsapp = config.whatsapp_business || {};
    for (const [brand, data] of Object.entries(whatsapp)) {
        const schedule = scheduleRenewal(`whatsapp:${brand}`, data.fecha_ultima_revision, 30);
        if (schedule) {
            schedules.push(schedule);
        }
    }

    return schedules;
}

function writeLog(schedules) {
    const today = new Date();
    const dateId = today.toISOString().slice(0, 10).replace(/-/g, '');
    const traceId = `${TRACE_PREFIX}-${dateId}`;
    const logPath = path.join(LOGS_DIR, `${traceId}.json`);

    const payload = {
        trace_id: traceId,
        generated_at: today.toISOString(),
        total_entries: schedules.length,
        schedules
    };

    fs.writeFileSync(logPath, JSON.stringify(payload, null, 2));
    return { traceId, logPath };
}

function updateConfigWithSchedules(config, schedules) {
    const updates = {};
    schedules.forEach(schedule => {
        const { entry, renewal_suggested } = schedule;
        if (entry.startsWith('facebook:')) {
            const [, pageKey, ...rest] = entry.split(':');
            if (rest.length === 0 && config.facebook?.[pageKey]) {
                config.facebook[pageKey].token_renovacion_programada = renewal_suggested;
            }
        }
    });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function main() {
    try {
        ensureLogsDir();
        const config = loadConfig();
        const schedules = collectSchedules(config);
        const { traceId, logPath } = writeLog(schedules);
        updateConfigWithSchedules(config, schedules);

        console.log('🔐 Renovación de tokens programada');
        console.log(`Trace ID: ${traceId}`);
        console.log(`Log generado: ${logPath}`);
        console.log(`Entradas programadas: ${schedules.length}`);
    } catch (error) {
        console.error('❌ Error al programar la renovación de tokens:', error.message);
        process.exit(1);
    }
}

main();
