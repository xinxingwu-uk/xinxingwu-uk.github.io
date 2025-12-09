(function(d,w){
  "use strict";
  var q=function(s){return d.querySelector(s)};
  var v=q(".input_video"), c=q("#canvas"), u=c.getContext("2d"), b=q("#toggleBtn");
  c.width=w.innerWidth||640;
  c.height=w.innerHeight||480;
  var L=new Image();
  L.src="midwaylogo.png";
  var S=[c.width/2,c.height/2,1,0,null,null,false,0,0];
  var T=[
    [0x1F590,32,83,104,111,119,32,76,97,110,100,109,97,114,107,115],
    [0x1F590,32,72,105,100,101,32,76,97,110,100,109,97,114,107,115]
  ];
  function f0(){
    var i=S[6]?1:0;
    b.textContent=T[i].map(function(ch){return String.fromCodePoint(ch)}).join("");
  }
  f0();
  b.addEventListener("click",function(){
    S[6]=!S[6];
    f0();
  });
  function p(pt){
    return {x:(1-pt.x)*c.width,y:pt.y*c.height};
  }
  function m0(a,b){
    return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  }
  function m1(a,b){
    return Math.hypot(b.x-a.x,b.y-a.y);
  }
  function m2(a,b){
    return Math.atan2(b.y-a.y,b.x-a.x);
  }
  function inside(pt,el){
    var r=el.getBoundingClientRect();
    return pt.x>=r.left&&pt.x<=r.right&&pt.y>=r.top&&pt.y<=r.bottom;
  }
  function clickByAir(){
    var t=Date.now();
    if(t-S[8]<700)return;
    S[8]=t;
    b.click();
  }
  function drawLogo(){
    var iw=L.width||0, ih=L.height||0;
    if(!iw||!ih)return;
    u.save();
    u.translate(S[0],S[1]);
    u.rotate(S[3]);
    u.scale(S[2],S[2]);
    u.drawImage(L,-iw/2,-ih/2);
    u.restore();
  }
  function onResults(res){
    u.clearRect(0,0,c.width,c.height);
    u.save();
    u.scale(-1,1);
    u.drawImage(v,-c.width,0,c.width,c.height);
    u.restore();
    var H=(res&&res.multiHandLandmarks)||[];
    if(!H.length){
      S[4]=S[5]=null;
      drawLogo();
      return;
    }
    var first=H[0];
    if(first&&first[8]){
      var tip=p(first[8]);
      if(inside(tip,b))clickByAir();
    }
    if(S[6]){
      for(var i=0;i<H.length;i++){
        var lm=H[i];
        var mm=lm.map(function(pt){return {x:1-pt.x,y:pt.y,z:pt.z};});
        drawConnectors(u,mm,HAND_CONNECTIONS,{color:"#00FF00",lineWidth:2});
        drawLandmarks(u,mm,{color:"#FF0000",lineWidth:2});
      }
    }
    if(H.length===2){
      var h0=H[0], h1=H[1];
      var a0=m0(h0[4],h0[8]), b0=m0(h1[4],h1[8]);
      a0=p(a0); b0=p(b0);
      var mid=m0(a0,b0);
      var dist=m1(a0,b0);
      var ang=m2(a0,b0);
      if(S[4]!=null&&S[5]!=null){
        if(S[4]>0)S[2]*=dist/S[4];
        S[3]+=ang-S[5];
      }
      S[4]=dist;
      S[5]=ang;
      S[0]=mid.x;
      S[1]=mid.y;
    }else{
      S[4]=S[5]=null;
    }
    drawLogo();
  }
  var h=new Hands({
    locateFile:function(file){
      return "https://cdn.jsdelivr.net/npm/@mediapipe/hands/"+file;
    }
  });
  h.setOptions({
    maxNumHands:2,
    modelComplexity:1,
    minDetectionConfidence:0.7,
    minTrackingConfidence:0.7
  });
  h.onResults(onResults);
  var cam=new Camera(v,{
    onFrame:async function(){
      await h.send({image:v});
    },
    width:640,
    height:480
  });
  cam.start();
})(document,window);
