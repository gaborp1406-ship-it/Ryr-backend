"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsteriskModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const asterick_gateway_1 = require("./asterick.gateway");
const asterisk_service_1 = require("./asterisk.service");
const asterisk_controller_1 = require("./asterisk.controller");
const amd_module_1 = require("../amd/amd.module");
const CallEventsService_1 = require("./events/CallEventsService");
const supabase_provider_1 = require("../leads/supabase.provider");
let AsteriskModule = class AsteriskModule {
};
exports.AsteriskModule = AsteriskModule;
exports.AsteriskModule = AsteriskModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, amd_module_1.AmdModule],
        controllers: [asterisk_controller_1.AriController],
        providers: [asterisk_service_1.AriService, asterick_gateway_1.AriGateway, CallEventsService_1.CallEventsService, supabase_provider_1.SupabaseProvider],
        exports: [asterisk_service_1.AriService, asterick_gateway_1.AriGateway, CallEventsService_1.CallEventsService],
    })
], AsteriskModule);
//# sourceMappingURL=asterisk.module.js.map