// Shared by the board and every phone specimen; palettes change color roles only.
window.OLEA_PALETTES = {
  green: {
    name: 'Olea green', description: 'The default', swatch: '#496754',
    light: {bg:'#f8faf7',paper:'#ffffff',ink:'#2e3931',muted:'#6a756d',line:'#e1e8e1',accent:'#496754',soft:'#e8f0e9',keyboard:'#e1e8e1','terminal-bg':'#233029','terminal-ink':'#e5eee7','terminal-accent':'#b4d1bb','terminal-muted':'#a3b5a7','terminal-keys':'#2d3d33','terminal-notice':'#34473b'},
    dark: {bg:'#242d27',paper:'#2e3931',ink:'#edf2ed',muted:'#b1bfb4',line:'#435047',accent:'#b4d1bb',soft:'#36483c',keyboard:'#344139','terminal-bg':'#202a24','terminal-ink':'#e5eee7','terminal-accent':'#b4d1bb','terminal-muted':'#a3b5a7','terminal-keys':'#2d3d33','terminal-notice':'#34473b'}
  },
  purple: {
    name: 'Soft purple', description: 'The original palette', swatch: '#66518a',
    light: {bg:'#faf9fc',paper:'#ffffff',ink:'#302d3d',muted:'#767082',line:'#e7e2ed',accent:'#66518a',soft:'#eee9f5',keyboard:'#e7e3ed','terminal-bg':'#292532','terminal-ink':'#e9e3f0','terminal-accent':'#c4b0df','terminal-muted':'#a69ab6','terminal-keys':'#342e3e','terminal-notice':'#393142'},
    dark: {bg:'#26232e',paper:'#302c3b',ink:'#f0edf6',muted:'#b5acc4',line:'#494153',accent:'#ccbaea',soft:'#3c334e',keyboard:'#3c3548','terminal-bg':'#25212e','terminal-ink':'#e9e3f0','terminal-accent':'#c4b0df','terminal-muted':'#a69ab6','terminal-keys':'#342e3e','terminal-notice':'#393142'}
  }
};
window.OLEA_PALETTE_KEY = 'olea-soft-palette-v1';
window.oleaReadPalette = () => {
  try {const id=localStorage.getItem(window.OLEA_PALETTE_KEY);return Object.hasOwn(window.OLEA_PALETTES,id)?id:'green'} catch {return 'green'}
};
window.oleaApplyPalette = (id,dark,element=document.body) => {
  if(!Object.hasOwn(window.OLEA_PALETTES,id))id='green';
  for(const [role,color]of Object.entries(window.OLEA_PALETTES[id][dark?'dark':'light']))element.style.setProperty('--'+role,color);
  element.dataset.palette=id;
  element.style.colorScheme=dark?'dark':'light';
};
