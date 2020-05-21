import { User, Query } from 'leanengine';
import { Cloud } from 'leancloud-storage';
import {
    JsonController,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Ctx,
    Authorized,
    OnUndefined
} from 'routing-controllers';
import { LCContext } from '../utility';

interface SignInToken {
    phone: string;
    code?: string;
}

@JsonController('/session')
export class SessionController {
    @Post('/smsCode')
    sendSMSCode(@Body() { phone }: SignInToken) {
        return Cloud.requestSmsCode(phone);
    }

    @Post('/')
    async signIn(
        @Ctx() context: LCContext,
        @Body() { phone, code }: SignInToken
    ) {
        const user = await User.signUpOrlogInWithMobilePhone(phone, code);

        const temp = await new Query('UserTemp')
            .equalTo('mobilePhoneNumber', phone)
            .first();

        if (temp) {
            const { objectId, createdAt, updatedAt, ...data } = temp.toJSON();

            await user.save(data, { user });

            await temp.destroy();
        }

        context.saveCurrentUser(user);

        return user.toJSON();
    }

    @Get('/')
    @Authorized()
    getProfile(@Ctx() { currentUser }: LCContext) {
        return currentUser.toJSON();
    }

    @Patch('/')
    @Authorized()
    async editProfile(
        @Ctx() { currentUser: user }: LCContext,
        @Body() body: any
    ) {
        return (await user.save(body, { user })).toJSON();
    }

    @Delete('/')
    @Authorized()
    @OnUndefined(200)
    destroy(@Ctx() context: LCContext) {
        context.currentUser.logOut();
        context.clearCurrentUser();
    }
}
