import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendForgotPassword(obj: { emailTo; subject; name; link }, lang = 'en') {
        await this.mailerService.sendMail({
            to: obj.emailTo,
            // from: '"HRM"', // override default from
            subject: obj.subject,
            template: `./forgot-password.${lang}.hbs`, // `.hbs` extension is appended automatically
            context: {
                // filling curly brackets with content
                name: obj.name,
                link: obj.link,
            },
        });
    }

    async sendNewPassword(obj: { emailTo; subject; name; password }, lang = 'en') {
        await this.mailerService.sendMail({
            to: obj.emailTo,
            // from: '"HRM"', // override default from
            subject: obj.subject,
            template: `./new-user.${lang}.hbs`, // `.hbs` extension is appended automatically
            context: {
                // filling curly brackets with content
                name: obj.name,
                password: obj.password,
            },
        });
    }
}
