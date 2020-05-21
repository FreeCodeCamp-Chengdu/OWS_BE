import { User } from 'leanengine';
import { Context } from 'koa';

export interface LCUser extends User {
    logOut(): any;
}

export interface LCContext extends Context {
    saveCurrentUser(user: User): any;
    currentUser: LCUser;
    clearCurrentUser(): any;
}
