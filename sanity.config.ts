import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {muxInput} from 'sanity-plugin-mux-input';
import {schemaTypes} from './sanity/schemaTypes';
export default defineConfig({name:'portfolio',title:'Monish · Portfolio',// Two build systems read this file. Next inlines NEXT_PUBLIC_*; the Sanity CLI
// (Vite) only inlines SANITY_STUDIO_*, so both are accepted — otherwise the
// standalone studio deploys pointing at "unconfigured".
projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID??process.env.SANITY_STUDIO_PROJECT_ID??'unconfigured',dataset:process.env.NEXT_PUBLIC_SANITY_DATASET??process.env.SANITY_STUDIO_DATASET??'production',basePath:'/studio',// Every type in the schema is a plain list — no singletons, nothing hidden.
plugins:[structureTool(),// Mux encodes an adaptive HLS ladder up to 1080p; cards stream it via <mux-video>.
muxInput({video_quality:'plus',max_resolution_tier:'1080p',acceptedMimeTypes:['video/*'],disableTextTrackConfig:true})],schema:{types:schemaTypes}});
