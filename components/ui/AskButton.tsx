'use client';
export function openChat(){window.dispatchEvent(new Event('open-chat'));}
export default function AskButton({children='Ask my AI',className='button secondary'}:{children?:React.ReactNode;className?:string}){return <button className={className} onClick={openChat}>{children}</button>;}
