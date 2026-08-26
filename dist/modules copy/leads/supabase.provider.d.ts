import { SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";
export declare const SupabaseProvider: {
    provide: string;
    inject: (typeof ConfigService)[];
    useFactory: (config: ConfigService) => SupabaseClient;
};
