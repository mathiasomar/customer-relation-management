export type Limmits = {
  maxMembers: number;
  [key: string]:
    | string
    | number
    | boolean
    | object
    | Array<string | number | boolean>
    | null;
};
