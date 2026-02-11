"use client";

import { AvatarGroup } from "@/components/avatar-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const title = "With Borders";

const Example = () => (
  <AvatarGroup>
    <Avatar className="border-2 border-background">
      <AvatarImage src="https://github.com/haydenbleasel.png" />
      <AvatarFallback>HB</AvatarFallback>
    </Avatar>
    <Avatar className="border-2 border-background">
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
    <Avatar className="border-2 border-background">
      <AvatarImage src="https://github.com/leerob.png" />
      <AvatarFallback>LR</AvatarFallback>
    </Avatar>
    <Avatar className="border-2 border-background">
      <AvatarImage src="https://github.com/serafimcloud.png" />
      <AvatarFallback>SC</AvatarFallback>
    </Avatar>
  </AvatarGroup>
);

export default Example;
