export const isCloudinaryUrl = (src: string) => src.includes("/upload/");

export const withTx = (src: string, tx: string) =>
  isCloudinaryUrl(src) ? src.replace("/upload/", `/upload/${tx}/`) : src;

export const lqip = (src: string) => withTx(src, "w_20,e_blur:1000,q_1,f_auto");
export const mainAt = (src: string, w: number) =>
  withTx(src, `c_limit,w_${w}/f_auto/q_auto`);
