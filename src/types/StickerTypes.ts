export enum StickerTypes {
  DEFAULT = "",
  SQUARE = `-vf "crop=min(iw\\,ih):min(iw\\,ih)"`,
  CIRCLE = `-i "src/mask.png" -filter_complex "[0]scale=400:400[ava];[1]alphaextract[alfa];[ava][alfa]alphamerge"`,
  FIT = `-vf "scale=iw*min(200/iw\\,200/ih):ih*min(200/iw\\,200/ih),pad=200:200:(200-iw*min(200/iw\\,200/ih))/2:(200-ih*min(200/iw\\,200/ih))/2"`
}