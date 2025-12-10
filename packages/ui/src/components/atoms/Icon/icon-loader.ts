const modules = import.meta.glob("./svgs/*.svg", { eager: true });

export const IconNames = Object.keys(modules).map((path) =>
  path.split("/").pop()!.replace(".svg", "")
);

export type IconName = (typeof IconNames)[number];
