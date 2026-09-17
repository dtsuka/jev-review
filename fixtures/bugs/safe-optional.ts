type Config = { nested?: { enabled?: boolean } };
export function enabled(config: Config) { return config.nested?.enabled ?? false; }
