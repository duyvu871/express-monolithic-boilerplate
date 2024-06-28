// @ts-ignore
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import path from "path";
import {DailyRotateFileTransportOptions} from "winston-daily-rotate-file";
import {Transports} from "winston/lib/winston/transports";
import AppConfig from '@/configs/app.config';

export class Logger {
    public name: string = '';
    constructor(name: string) {
        this.name = name;
    }
    public static LoggerFormat: any = winston.format.printf((info: any) => {
        return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`;
    });

    public static getTransportsList(): any[] {
        const transports: any[] = [];
        if (process.env.NODE_ENV !== 'production') {
            transports.push(new winston.transports.Console({
                level: 'debug',
                format: winston.format.combine(
                    winston.format.colorize({
                        colors: Logger.colorMap
                    }),
                    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                    Logger.LoggerFormat
                )
            }));
        }
        transports.push(new winston.transports.DailyRotateFile({
            filename: path.join(AppConfig.app_root, 'storage/Log', 'log-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d', // keep logs for 14 days
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                Logger.LoggerFormat
            )
        }));
        return transports;
    }

    public static options: winston.LoggerOptions = {
        transports: [
            ...Logger.getTransportsList()
        ]
    };
    static colorMap: any = {
        info: 'green',
        error: 'red',
        warn: 'yellow',
        debug: 'blue'
    };
    private logger: winston.Logger = winston.createLogger(Logger.options);

    public getLogger() {
        return this.logger;
    }
}