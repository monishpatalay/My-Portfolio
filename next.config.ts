import type {NextConfig} from 'next';
// Note: do NOT add sanity/next-sanity to serverExternalPackages. It fixes the
// swr react-server build error but makes Node load them with their own copy of
// React, which breaks Studio at runtime with "Invalid hook call". The build is
// kept green instead by loading Studio client-only — see app/studio.
const config:NextConfig={images:{remotePatterns:[{protocol:'https',hostname:'cdn.sanity.io'}],formats:['image/avif','image/webp']},async redirects(){return[{source:'/myworks',destination:'/work',permanent:true},{source:'/play',destination:'/playground',permanent:true}];},async headers(){return[{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},{key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains; preload'}]}];}};
export default config;
