import moment from 'moment';

function initMoment() {
    moment.tz.setDefault(process.env.TZ);
    moment.updateLocale('en', {
        week: {
            dow: 1,
        },
    });

    console.log('LOG:: initMoment:', moment().format('YYYY-MM-DD HH:mm:ss'));
}

export function bootstrapMoment(): void {
    initMoment();
}
