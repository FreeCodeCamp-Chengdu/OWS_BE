import { JsonController, Post, QueryParam, Body } from 'routing-controllers';
import { User } from 'leanengine';

interface SignInToken {
    phone: string;
    code: string;
}

@JsonController('/session')
export default class SessionController {
    @Post('/smsCode')
    sendSMSCode(@QueryParam('phone') phone: string) {
        return User.requestLoginSmsCode(phone);
    }

    @Post('/')
    async create(@Body() { phone, code }: SignInToken) {
        const user = await User.signUpOrlogInWithMobilePhone(phone, code);

        return user.toJSON();
    }
}
