import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";

export const SupabaseProvider = {
    provide: "SUPABASE_CLIENT",
    inject: [ConfigService],
    useFactory: (config: ConfigService): SupabaseClient => {
        const url = config.get<string>("SUPABASE_URL");
        const key = config.get<string>("SUPABASE_KEY");

        if (!url || !key) {
            throw new Error("SUPABASE_URL o SUPABASE_KEY no definidos");
        }

        return createClient(url, key);
    },
};
