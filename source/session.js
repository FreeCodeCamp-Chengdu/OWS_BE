import { User } from 'leanengine';

import { OAuth } from './GitHub';

const { GITHUB_APP_ID, GITHUB_APP_SECRET } = process.env;

export function entry(context) {
    context.body = `
<h1>Hello, ${
    context.currentUser ? context.currentUser.get('username') : 'FCC-CDC'
}!</h1>
<a href="https://github.com/login/oauth/authorize?client_id=${GITHUB_APP_ID}&scope=user,repo">
Sign in
</a>`;
}

export const GitHub = OAuth(
    GITHUB_APP_ID,
    GITHUB_APP_SECRET,
    async (context, body) => {
        const user = await User.loginWithAuthData(
            {
                access_token: body.access_token,
                expires_in: 7200,
                uid: body.user.id + '',
                scope: body.scope + ''
            },
            'github'
        );

        context.saveCurrentUser(user);

        await user.save(
            {
                username: body.user.login,
                email: body.user.email,
                github: body.user
            },
            { user }
        );

        context.redirect('/?token=' + body.access_token);
    }
);
