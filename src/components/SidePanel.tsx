import React from 'react'
import type { Article } from '../types'

export default function SidePanel({ article, onClose }:{article: Article | null; onClose:()=>void}){
  if(!article) return null
  return (
    <aside role="dialog" aria-label="Article details" style={{position:'fixed',right:20,top:20,bottom:20,width:480,background:'var(--panel)',padding:18,borderRadius:8,boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}}>
      <button onClick={onClose} aria-label="Fermer" style={{position:'absolute',right:12,top:12,background:'transparent',border:'none',color:'var(--muted)'}}>✕</button>
      <h2 style={{marginTop:0}}>{article.title}</h2>
      <div style={{color:'var(--muted)',fontSize:13}}>{article.source} • {article.publishedAt}</div>
      <hr style={{margin:'12px 0',borderColor:'rgba(255,255,255,0.04)'}} />
      <div style={{overflow:'auto',maxHeight:'60%'}}>
        <p style={{lineHeight:1.5}}>{article.summary ?? article.content ?? 'Pas de contenu disponible.'}</p>
      </div>
      <div style={{marginTop:12}}>
        <a href={article.url ?? '#'} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>Voir la source</a>
      </div>
    </aside>
  )
}
