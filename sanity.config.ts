import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {schemaTypes} from './sanity/schemaTypes';
export default defineConfig({name:'portfolio',title:'Monish · Portfolio',projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID??'unconfigured',dataset:process.env.NEXT_PUBLIC_SANITY_DATASET??'production',basePath:'/studio',// Every type in the schema is a plain list — no singletons, nothing hidden.
plugins:[structureTool()],schema:{types:schemaTypes}});
