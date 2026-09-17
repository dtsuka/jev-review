export function pageSize(value?: number) { return value || 20; }
// A caller explicitly passing 0 to disable paging is incorrectly changed to 20.
