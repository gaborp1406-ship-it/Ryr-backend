"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseProvider = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
exports.SupabaseProvider = {
    provide: "SUPABASE_CLIENT",
    inject: [config_1.ConfigService],
    useFactory: (config) => {
        const url = config.get("SUPABASE_URL");
        const key = config.get("SUPABASE_KEY");
        if (!url || !key) {
            throw new Error("SUPABASE_URL o SUPABASE_KEY no definidos");
        }
        return (0, supabase_js_1.createClient)(url, key);
    },
};
//# sourceMappingURL=supabase.provider.js.map