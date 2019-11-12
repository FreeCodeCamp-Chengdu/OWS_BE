import { Context } from 'koa';
import { User } from 'leanengine';
import {
    JsonController,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Ctx,
    UnauthorizedError
} from 'routing-controllers';

interface SignInToken {
    phone: string;
    code?: string;
}

@JsonController('/session')
export default class SessionController {
    @Post('/smsCode')
    sendSMSCode(@Body() { phone }: SignInToken) {
        return User.requestLoginSmsCode(phone);
    }

    @Post('/')
    async signIn(
        @Body() { phone, code }: SignInToken,
        @Ctx() context: Context
    ) {
        const user = await User.logInWithMobilePhoneSmsCode(phone, code);

        context.saveCurrentUser(user);

        return user.toJSON();
    }

    @Get('/')
    getProfile(@Ctx() { currentUser }: Context) {
        if (!currentUser) throw new UnauthorizedError();

        return currentUser.toJSON();
    }

    @Patch('/')
    async editProfile(@Ctx() { currentUser }: Context, @Body() body: any) {
        if (!currentUser) throw new UnauthorizedError();

        await currentUser.save(body, { user: currentUser });

        return currentUser.toJSON();
    }

    @Delete('/')
    destroy(@Ctx() context: Context) {
        if (!context.currentUser) throw new UnauthorizedError();

        context.currentUser.logOut();
        context.clearCurrentUser();

        return '';
    }
}
