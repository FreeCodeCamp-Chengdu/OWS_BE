"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = exports.update = void 0;
const leanengine_1 = require("leanengine");
const it_events_1 = __importDefault(require("@fcc-cdc/it-events"));
const routing_controllers_1 = require("routing-controllers");
class Activity extends leanengine_1.Object {
}
async function update(interval) {
    const list = (await new leanengine_1.Query(Activity)
        .greaterThanOrEqualTo('start', new Date())
        .limit(1000)
        .find()).map(item => item.toJSON());
    for await (const { objectId, createdAt, updatedAt, link, banner, ...rest } of it_events_1.default(list, interval)) {
        const data = objectId
            ? leanengine_1.Object.createWithoutData('Activity', objectId)
            : new Activity();
        await data.save({ link: link + '', banner: banner + '', ...rest });
    }
}
exports.update = update;
let ActivityController = /** @class */ (() => {
    let ActivityController = class ActivityController {
        async search(keywords, page = 1, rows = 10, from, to) {
            const query = keywords
                ? leanengine_1.Query.or(new leanengine_1.Query(Activity).contains('title', keywords), new leanengine_1.Query(Activity).contains('address', keywords))
                : new leanengine_1.Query(Activity);
            if (from)
                query.greaterThanOrEqualTo('start', new Date(from));
            if (to)
                query.lessThanOrEqualTo('start', new Date(to));
            const list = await query
                .addDescending('start')
                .addDescending('end')
                .limit(rows)
                .skip((page - 1) * rows)
                .find();
            return list.map(item => item.toJSON());
        }
    };
    __decorate([
        routing_controllers_1.Get(),
        __param(0, routing_controllers_1.QueryParam('keywords')),
        __param(1, routing_controllers_1.QueryParam('page')),
        __param(2, routing_controllers_1.QueryParam('rows')),
        __param(3, routing_controllers_1.QueryParam('from')),
        __param(4, routing_controllers_1.QueryParam('to')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, Object, String, String]),
        __metadata("design:returntype", Promise)
    ], ActivityController.prototype, "search", null);
    ActivityController = __decorate([
        routing_controllers_1.JsonController('/activity')
    ], ActivityController);
    return ActivityController;
})();
exports.ActivityController = ActivityController;
//# sourceMappingURL=Activity.js.map