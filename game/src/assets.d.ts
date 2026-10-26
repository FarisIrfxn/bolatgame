declare module "virtual:game-assets" {
  const assets: readonly { url: string; bytes: number }[];
  export const version: string;
  export default assets;
}
