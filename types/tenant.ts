export type TenantPermissions = {
  [key: string]:
    | string
    | number
    | boolean
    | object
    | Array<string | number | boolean>
    | null;
};
