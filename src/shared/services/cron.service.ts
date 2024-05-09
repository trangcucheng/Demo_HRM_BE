import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { SCHEDULE_TYPE } from '~/common/enums/enum';

@Injectable()
export class CronService {
    // private static readonly logger = new Logger(CronService.name);
    // private static readonly schedulerRegistry: SchedulerRegistry;

    constructor(private schedulerRegistry: SchedulerRegistry) {}

    doesExist(type: 'cron' | 'timeout' | 'interval', name: string) {
        return this.schedulerRegistry.doesExist(type, name);
    }

    addInterval(name: string, milliseconds: number, callback) {
        console.warn(`CronService: Interval ${name} is running after ${milliseconds} milliseconds`);

        callback();

        const interval = setInterval(callback, milliseconds);
        this.schedulerRegistry.addInterval(name, interval);
    }

    deleteInterval(name: string) {
        this.schedulerRegistry.deleteInterval(name);
        console.warn(`CronService: Interval ${name} deleted!`);
    }

    safeDeleteInterval(name: string) {
        if (this.doesExist(SCHEDULE_TYPE.INTERVAL, name)) this.deleteInterval(name);
    }

    getIntervals() {
        const intervals = this.schedulerRegistry.getIntervals();
        intervals.forEach((key) => console.log(`Interval: ${key}`));
    }

    addCronJob(name: string, cronRule, callback) {
        const job = new CronJob(cronRule, callback);

        this.schedulerRegistry.addCronJob(name, job);
        job.start();

        console.warn(`CronService: Job ${name} is running with rule ${cronRule}`);
    }

    deleteCron(name: string) {
        this.schedulerRegistry.deleteCronJob(name);
        console.warn(`CronService: Job ${name} deleted!`);
    }

    safeDeleteCron(name: string) {
        if (this.doesExist(SCHEDULE_TYPE.CRON, name)) this.deleteCron(name);
    }

    getCrons() {
        const jobs = this.schedulerRegistry.getCronJobs();
        jobs.forEach((value, key, map) => {
            let next;
            try {
                next = value.nextDates().toJSDate();
            } catch (e) {
                next = 'error: next fire date is in the past!';
            }
            console.log(`CronService: job: ${key} -> next: ${next}`);
        });
    }

    addTimeout(name: string, milliseconds: number, callback) {
        console.warn(`CronService: Timeout ${name} is running after ${milliseconds} milliseconds`);

        const timeout = setTimeout(callback, milliseconds);
        this.schedulerRegistry.addTimeout(name, timeout);
    }

    deleteTimeout(name: string) {
        this.schedulerRegistry.deleteTimeout(name);
        console.warn(`CronService: Timeout ${name} deleted!`);
    }

    safeDeleteTimeout(name: string) {
        if (this.doesExist(SCHEDULE_TYPE.TIMEOUT, name)) this.deleteTimeout(name);
    }

    getTimeouts() {
        const timeouts = this.schedulerRegistry.getTimeouts();
        timeouts.forEach((key) => console.log(`Timeout: ${key}`));
    }
}
