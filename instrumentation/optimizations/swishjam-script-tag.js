class SwishjamScriptTag extends HTMLScriptElement{
  constructor(){
    super()
    console.log('Hello from SwishjamScriptTag init!');
  }

  set src(url){
    console.log('Hello from SwishjamScriptTag set src!');
    this.src = `https://scripts.swishjam.com/proxy?url=${url}`
  }
}
customElements.define('swishjam-script-tag', SwishjamScriptTag, { extends: 'script' });

var s = document.createElement('script');
s.setAttribute('is', 'swishjam-script-tag');
s.src = 'https://www.google.com';
document.body.appendChild(s);