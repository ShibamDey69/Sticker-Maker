export enum StickerTypes {
  DEFAULT = '',
  SQUARE = '-vf "crop=min(iw\\,ih):min(iw\\,ih)"',
  CIRCLE = '-filter_complex "crop=min(iw\\,ih):min(iw\\,ih), scale=iw*2:ih*2, format=rgba, geq=r=\'r(X\\,Y)\':g=\'g(X\\,Y)\':b=\'b(X\\,Y)\':a=\'if(lte(sqrt((X-W/2)^2 + (Y-H/2)^2)\\, min(W\\,H)/2)\\, 255\\, 0)\'"',
  FIT = '-vf "scale=iw*min(200/iw\\,200/ih):ih*min(200/iw\\,200/ih),pad=200:200:(200-iw*min(200/iw\\,200/ih))/2:(200-ih*min(200/iw\\,200/ih))/2"'
}