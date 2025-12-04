// main.js — interactive behavior with collapse functionality

document.addEventListener('DOMContentLoaded', ()=>{
  const posts = document.querySelectorAll('.post')
  if(!posts || posts.length===0) return
  
  // Add click handlers for collapse/expand
  posts.forEach((post)=>{
    const header = post.querySelector('.post-header')
    if(!header) return
    
    header.addEventListener('click',()=>{
      post.classList.toggle('expanded')
    })
  })
})
