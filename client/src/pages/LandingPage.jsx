import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState, useCallback } from 'react';

// ────────────────────────────────────────────────────────────────────────────
// 🖼️  LOGO — Drop your logo file at:  client/src/assets/logo.png  (or .svg)
// Then uncomment the import below and delete the placeholder block.
import logo from '../assets/logo.png';
// ────────────────────────────────────────────────────────────────────────────
const LOGO_PLACEHOLDER = false; // set to false once you add your logo file

/* ── Data ─────────────────────────────────────────────────── */
const features = [
  { icon:'📊', title:'Visual Analytics', desc:'Stunning charts tracking your progress — velocity, difficulty spread, and more.', color:'#6c63ff', code:'chart.render(data)' },
  { icon:'🧠', title:'Smart Insights',   desc:'AI-powered weakness detection and personalised recommendations.',              color:'#00d4ff', code:'ai.analyse(user)' },
  { icon:'🔥', title:'Streak Tracking',  desc:'Daily solve streaks with GitHub-style heatmap to keep you consistent.',        color:'#ff6b35', code:'streak.update()' },
  { icon:'🎯', title:'Goal Setting',     desc:'Set daily and total targets. Track your journey to interview-readiness.',       color:'#00e5a0', code:'goal.track(n)' },
  { icon:'🔍', title:'Smart Filters',    desc:'Filter by topic, difficulty, platform, and status instantly.',                  color:'#ffb347', code:'filter.apply()' },
  { icon:'⚡', title:'Multi-Platform',   desc:'Track LeetCode, Codeforces, GFG, HackerRank and more in one place.',           color:'#ff6b9d', code:'sync.all()' },
];

const HERO_WORDS = ['intelligence', 'precision', 'clarity', 'momentum'];

const DSA_SYMBOLS = [
  'O(n log n)','O(1)','dp[i][j]','BFS','DFS',
  'quickSort','mergeSort','Dijkstra','trie.insert',
  'stack.pop()','queue.enqueue','graph.dfs()',
  'n!','2ⁿ','∑','∫','√n','≤','≥',
  '01010','11001','#hash','fn(x)','//O(n)',
  '{map}','[arr]','(tree)','→next','∞loop',
];

/* ── Canvas: particle network + aurora waves + hexgrid ─────── */
const ParticleCanvas = ({ mouseX, mouseY }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const COUNT = Math.min(110, Math.floor((W * H) / 10000));
    const LINK  = 150;
    const COLS  = ['rgba(108,99,255,','rgba(0,212,255,','rgba(0,229,160,','rgba(255,107,157,'];

    // Particles
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      ox: 0, oy: 0,
      vx: (Math.random()-0.5)*0.45, vy: (Math.random()-0.5)*0.45,
      r: Math.random()*2.5+0.8,
      col: COLS[Math.floor(Math.random()*COLS.length)],
      ph: Math.random()*Math.PI*2,
      pulse: Math.random()*0.05 + 0.01,
    }));

    // Shooting stars
    const stars = [];
    const spawnStar = () => {
      if (stars.length > 5) return;
      const ang = Math.PI/4 + (Math.random()-0.5)*0.5;
      stars.push({
        x: Math.random()*W*0.8, y: Math.random()*H*0.3,
        len: Math.random()*160+80, spd: Math.random()*8+4,
        op: 1, ang, trail: [],
      });
    };
    const si = setInterval(spawnStar, 1800);

    // Hex grid nodes
    const HEX_SIZE = 52;
    const hexNodes = [];
    for (let hx = -HEX_SIZE; hx < W + HEX_SIZE; hx += HEX_SIZE * 1.73) {
      for (let hy = -HEX_SIZE; hy < H + HEX_SIZE * 2; hy += HEX_SIZE * 1.5) {
        const offset = (Math.round(hx / (HEX_SIZE * 1.73)) % 2) * (HEX_SIZE * 0.75);
        hexNodes.push({ x: hx, y: hy + offset, ph: Math.random()*Math.PI*2 });
      }
    }

    let mx = W/2, my = H/2;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', onResize);

    let frame = 0;
    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      /* ── Aurora wave ── */
      const aOff = frame * 0.003;
      for (let ay = 0; ay < H; ay += 4) {
        const t = ay / H;
        const wave = Math.sin(t * 3 + aOff) * 0.5 + 0.5;
        const wave2 = Math.cos(t * 2 + aOff * 1.4) * 0.5 + 0.5;
        const alpha = wave * wave2 * 0.025;
        const hue = 250 + wave * 60;
        ctx.fillStyle = `hsla(${hue},80%,60%,${alpha})`;
        ctx.fillRect(0, ay, W, 4);
      }

      /* ── Hex grid ── */
      hexNodes.forEach(h => {
        h.ph += 0.008;
        const a = (Math.sin(h.ph)*0.5+0.5) * 0.06;
        if (a < 0.005) return;
        ctx.strokeStyle = `rgba(108,99,255,${a})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (Math.PI/3)*k - Math.PI/6;
          const px = h.x + HEX_SIZE*0.47*Math.cos(angle);
          const py = h.y + HEX_SIZE*0.47*Math.sin(angle);
          k===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.stroke();
      });

      /* ── Mouse-reactive particles ── */
      pts.forEach(p => {
        p.ph += p.pulse;
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) {
          const force = (200 - dist) / 200 * 0.6;
          p.vx -= (dx/dist) * force * 0.08;
          p.vy -= (dy/dist) * force * 0.08;
        }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const a = 0.45 + Math.sin(p.ph)*0.3;
        const r = p.r + Math.sin(p.ph)*0.7;
        // Glow
        const grd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*3);
        grd.addColorStop(0, p.col+a+')');
        grd.addColorStop(1, p.col+'0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r*3, 0, Math.PI*2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI*2);
        ctx.fillStyle = p.col+Math.min(a+0.2,1)+')';
        ctx.fill();
      });

      /* ── Connections ── */
      for (let i=0; i<pts.length; i++) for (let j=i+1; j<pts.length; j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if (d<LINK) {
          const a=(1-d/LINK)*0.2;
          const g=ctx.createLinearGradient(pts[i].x,pts[i].y,pts[j].x,pts[j].y);
          g.addColorStop(0, pts[i].col+a+')');
          g.addColorStop(1, pts[j].col+a+')');
          ctx.beginPath();
          ctx.moveTo(pts[i].x,pts[i].y);
          ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=g; ctx.lineWidth=0.9; ctx.stroke();
        }
      }

      /* ── Shooting stars ── */
      for (let i=stars.length-1; i>=0; i--) {
        const s=stars[i];
        s.trail.push({x:s.x,y:s.y,op:s.op});
        if (s.trail.length > 12) s.trail.shift();
        s.trail.forEach((pt,ti) => {
          const ta = (ti/s.trail.length)*pt.op*0.6;
          if (ta < 0.01) return;
          const tw = (ti/s.trail.length)*2;
          ctx.beginPath();
          ctx.arc(pt.x,pt.y,tw,0,Math.PI*2);
          ctx.fillStyle=`rgba(0,212,255,${ta})`;
          ctx.fill();
        });
        const ex=s.x+Math.cos(s.ang)*s.len, ey=s.y+Math.sin(s.ang)*s.len;
        const g=ctx.createLinearGradient(s.x,s.y,ex,ey);
        g.addColorStop(0,`rgba(255,255,255,0)`);
        g.addColorStop(0.3,`rgba(0,212,255,${s.op})`);
        g.addColorStop(0.7,`rgba(108,99,255,${s.op*0.5})`);
        g.addColorStop(1,`rgba(108,99,255,0)`);
        ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(ex,ey);
        ctx.strokeStyle=g; ctx.lineWidth=2; ctx.stroke();
        s.x+=Math.cos(s.ang)*s.spd; s.y+=Math.sin(s.ang)*s.spd; s.op-=0.01;
        if (s.op<=0||s.x>W||s.y>H) stars.splice(i,1);
      }

      animId = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(animId);
      clearInterval(si);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);
  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}} />;
};

/* ── Typewriter hook ───────────────────────────────────────── */
const useTypewriter = (words, speed=80, pause=2200) => {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    const delay = deleting ? speed*0.5 : charIdx === word.length ? pause : speed;
    const t = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setDisplay(word.slice(0,charIdx+1));
        setCharIdx(c=>c+1);
      } else if (!deleting && charIdx === word.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(word.slice(0,charIdx-1));
        setCharIdx(c=>c-1);
      } else {
        setDeleting(false);
        setWordIdx(i=>(i+1)%words.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return display;
};

/* ── Animated counter ─────────────────────────────────────── */
const Counter = ({ target, suffix='' }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold:0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const num = parseInt(target.replace(/\D/g,''));
    let st = null;
    const dur = 1800;
    const step = (ts) => {
      if (!st) st = ts;
      const p = Math.min((ts-st)/dur, 1);
      const ease = 1 - Math.pow(1-p, 3);
      setCount(Math.floor(ease*num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target]);
  const numPart = parseInt(target.replace(/\D/g,''));
  const nonNumSuffix = target.replace(/[\d]/g,'');
  return <span ref={ref}>{count.toLocaleString()}{nonNumSuffix}{suffix}</span>;
};

/* ── Feature Card with live code snippet ──────────────────── */
const FeatureCard = ({ f, i }) => {
  const [hovered, setHovered] = useState(false);
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (!hovered) { setTyped(''); return; }
    let idx = 0;
    const t = setInterval(() => {
      if (idx <= f.code.length) { setTyped(f.code.slice(0,idx)); idx++; }
      else clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, [hovered, f.code]);
  return (
    <motion.div
      className="glass-card feature-card"
      initial={{opacity:0,y:50}}
      whileInView={{opacity:1,y:0}}
      viewport={{once:true}}
      transition={{delay:i*0.08,duration:0.55,ease:[0.22,1,0.36,1]}}
      whileHover={{y:-8}}
      onHoverStart={()=>setHovered(true)}
      onHoverEnd={()=>setHovered(false)}
      style={{position:'relative',overflow:'hidden',cursor:'default'}}
    >
      {/* Animated border trace on hover */}
      {hovered && (
        <motion.div
          initial={{opacity:0}}
          animate={{opacity:1}}
          style={{
            position:'absolute',inset:0,borderRadius:'inherit',pointerEvents:'none',
            background:`radial-gradient(circle at 50% 0%, ${f.color}22 0%, transparent 70%)`,
          }}
        />
      )}
      {/* Glowing top border */}
      <motion.div
        animate={{scaleX: hovered ? 1 : 0.2, opacity: hovered ? 1 : 0.3}}
        style={{
          position:'absolute',top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg, transparent, ${f.color}, transparent)`,
          transformOrigin:'left',
          borderRadius:'inherit',
        }}
        transition={{duration:0.4}}
      />
      <div style={{position:'relative',zIndex:1}}>
        <motion.div
          className="feature-icon"
          animate={{scale: hovered ? 1.15 : 1, rotate: hovered ? [0,8,-4,0] : 0}}
          transition={{duration:0.4}}
        >
          {f.icon}
        </motion.div>
        <div className="feature-title">{f.title}</div>
        <div className="feature-desc">{f.desc}</div>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{opacity:0,y:10,height:0}}
              animate={{opacity:1,y:0,height:'auto'}}
              exit={{opacity:0,y:8,height:0}}
              transition={{duration:0.25}}
              style={{
                marginTop:14,
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:12,
                color: f.color,
                background:'rgba(0,0,0,0.3)',
                borderRadius:6,
                padding:'8px 12px',
                border:`1px solid ${f.color}33`,
              }}
            >
              <span style={{color:'rgba(255,255,255,0.3)'}}>{'> '}</span>
              {typed}<motion.span
                animate={{opacity:[1,0]}}
                transition={{duration:0.5,repeat:Infinity}}
                style={{display:'inline-block',width:2,height:'1em',background:f.color,verticalAlign:'text-bottom',marginLeft:2}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ── Mock Code Editor in hero ─────────────────────────────── */
const CodeEditor = () => {
  const lines = [
    { txt: 'const tracker = new AlgoTrack();', col: '#e8eaf6' },
    { txt: 'tracker.solve({', col: '#e8eaf6' },
    { txt: '  problem: "Two Sum",', col: '#00e5a0' },
    { txt: '  difficulty: "Easy",', col: '#ffb347' },
    { txt: '  time: "O(n)", space: "O(n)",', col: '#00d4ff' },
    { txt: '  platform: "LeetCode",', col: '#6c63ff' },
    { txt: '});', col: '#e8eaf6' },
    { txt: '// 🔥 Streak: 47 days', col: '#ff6b35' },
    { txt: '// 📊 Progress: 847 solved', col: '#6c63ff' },
  ];
  return (
    <motion.div
      initial={{opacity:0,x:60,rotateY:-15}}
      animate={{opacity:1,x:0,rotateY:0}}
      transition={{delay:0.9,duration:0.8,ease:[0.22,1,0.36,1]}}
      style={{
        perspective:1000,
        width:'100%',maxWidth:480,
        background:'rgba(5,11,21,0.9)',
        border:'1px solid rgba(108,99,255,0.3)',
        borderRadius:16,
        overflow:'hidden',
        boxShadow:'0 24px 80px rgba(108,99,255,0.2),0 0 0 1px rgba(108,99,255,0.1)',
        backdropFilter:'blur(20px)',
        flexShrink:0,
      }}
    >
      {/* Title bar */}
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'12px 16px',background:'rgba(255,255,255,0.03)',borderBottom:'1px solid rgba(108,99,255,0.15)'}}>
        {['#ff5f57','#ffbd2e','#28c840'].map(c=>(
          <div key={c} style={{width:12,height:12,borderRadius:'50%',background:c,opacity:0.9}} />
        ))}
        <span style={{marginLeft:8,fontSize:12,color:'rgba(255,255,255,0.3)',fontFamily:"'JetBrains Mono',monospace"}}>algo-track.js</span>
      </div>
      {/* Code lines */}
      <div style={{padding:'20px 24px',fontFamily:"'JetBrains Mono',monospace",fontSize:13,lineHeight:2}}>
        {lines.map((l,i)=>(
          <motion.div
            key={i}
            initial={{opacity:0,x:-10}}
            animate={{opacity:1,x:0}}
            transition={{delay:1.1+i*0.1,duration:0.4}}
            style={{display:'flex',gap:16}}
          >
            <span style={{color:'rgba(255,255,255,0.15)',userSelect:'none',minWidth:16,textAlign:'right'}}>{i+1}</span>
            <span style={{color:l.col}}>{l.txt}</span>
          </motion.div>
        ))}
        <motion.div
          animate={{opacity:[1,0]}}
          transition={{duration:0.7,repeat:Infinity}}
          style={{display:'inline-block',width:8,height:16,background:'#6c63ff',marginLeft:32,verticalAlign:'middle'}}
        />
      </div>
      {/* Status bar */}
      <div style={{display:'flex',gap:16,padding:'8px 16px',background:'rgba(108,99,255,0.12)',borderTop:'1px solid rgba(108,99,255,0.15)',fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:"'JetBrains Mono',monospace"}}>
        <span> JavaScript</span>
        <span style={{marginLeft:'auto'}}>Ln 9, Col 1</span>
        <span>UTF-8</span>
      </div>
    </motion.div>
  );
};

/* ── Main LandingPage ─────────────────────────────────────── */
const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const typedWord = useTypewriter(HERO_WORDS, 75, 2000);

  // Mouse parallax
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, {stiffness:60,damping:25});
  const sy = useSpring(my, {stiffness:60,damping:25});
  const px = useTransform(sx, v=>v*18);
  const py = useTransform(sy, v=>v*18);
  const px2 = useTransform(sx, v=>v*-10);
  const py2 = useTransform(sy, v=>v*-10);

  const onMouseMove = useCallback(e => {
    mx.set((e.clientX/window.innerWidth - 0.5));
    my.set((e.clientY/window.innerHeight - 0.5));
  }, [mx, my]);

  return (
    <div className="landing-page" onMouseMove={onMouseMove}>

      {/* ── Canvas Background ── */}
      <ParticleCanvas />

      {/* ── Gradient blobs + scan lines ── */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
        {[
          {w:800,h:800,l:'-12%',t:'-15%',c:'rgba(108,99,255,0.09)',dur:20,dx:[0,80,-50,30,0],dy:[0,-60,40,-20,0]},
          {w:650,h:650,l:'65%', t:'55%', c:'rgba(0,212,255,0.07)', dur:25,dx:[0,-60,35,-20,0],dy:[0,50,-30,15,0]},
          {w:550,h:550,l:'30%', t:'5%',  c:'rgba(0,229,160,0.055)',dur:18,dx:[0,35,-25,10,0],dy:[0,-35,22,-12,0]},
          {w:460,h:460,l:'80%', t:'5%',  c:'rgba(255,107,157,0.06)',dur:22,dx:[0,-45,30,-12,0],dy:[0,35,-22,10,0]},
          {w:400,h:400,l:'5%',  t:'65%', c:'rgba(255,179,71,0.05)', dur:16,dx:[0,28,-18,8,0],dy:[0,-28,18,-8,0]},
        ].map((b,i)=>(
          <motion.div key={i} style={{
            position:'absolute',width:b.w,height:b.h,left:b.l,top:b.t,
            borderRadius:'50%',
            background:`radial-gradient(circle, ${b.c}, transparent 70%)`,
            filter:'blur(80px)',
          }}
            animate={{x:b.dx,y:b.dy,scale:[1,1.18,0.88,1.06,1]}}
            transition={{duration:b.dur,repeat:Infinity,ease:'easeInOut'}}
          />
        ))}

        {/* Pulsing rings */}
        {[200,360,540,720].map((sz,i)=>(
          <motion.div key={`ring${i}`} style={{
            position:'absolute',left:'50%',top:'38%',
            transform:'translate(-50%,-50%)',
            width:sz,height:sz,borderRadius:'50%',
            border:`1px solid rgba(108,99,255,${0.15-i*0.03})`,
            boxShadow:`0 0 ${18+i*14}px rgba(108,99,255,${0.05-i*0.01})`,
          }}
            animate={{scale:[1,1.12,1],opacity:[0.8,0.1,0.8]}}
            transition={{duration:3.5+i*1.8,repeat:Infinity,ease:'easeInOut',delay:i*1.1}}
          />
        ))}

        {/* H-scanline */}
        <motion.div style={{
          position:'absolute',left:0,right:0,height:2,top:0,
          background:'linear-gradient(90deg,transparent 0%,rgba(108,99,255,0.4) 30%,rgba(0,212,255,0.3) 70%,transparent 100%)',
          boxShadow:'0 0 30px rgba(108,99,255,0.25)',
        }}
          animate={{y:[-2,'100vh']}}
          transition={{duration:10,repeat:Infinity,ease:'linear',repeatDelay:6}}
        />
        {/* V-scanline */}
        <motion.div style={{
          position:'absolute',top:0,bottom:0,width:2,left:0,
          background:'linear-gradient(180deg,transparent 0%,rgba(0,212,255,0.22) 40%,rgba(108,99,255,0.18) 70%,transparent 100%)',
        }}
          animate={{x:[-2,'100vw']}}
          transition={{duration:15,repeat:Infinity,ease:'linear',repeatDelay:8}}
        />
      </div>

      {/* ── Floating DSA tokens ── */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
        {DSA_SYMBOLS.map((sym,i)=>{
          const col=['rgba(108,99,255,','rgba(0,212,255,','rgba(0,229,160,','rgba(255,179,71,','rgba(255,107,157,'][i%5];
          return (
            <motion.div key={sym+i} style={{
              position:'absolute',
              left:`${(i*3.3+1.5)%94}%`,
              top:`${(i*7+4)%88}%`,
              fontSize:10+(i%6),
              fontFamily:"'JetBrains Mono',monospace",
              fontWeight:600,
              color:`${col}0.16)`,
              userSelect:'none', whiteSpace:'nowrap',
            }}
              animate={{
                y:[0,-(30+i%22),10,-14,0],
                x:[0,14-(i%10),-8,5,0],
                opacity:[0.1,0.38,0.15,0.35,0.1],
                rotate:[0,i%2?9:-9,0],
                scale:[1,1.04,0.97,1],
              }}
              transition={{duration:15+i%12,repeat:Infinity,ease:'easeInOut',delay:(i*1.15)%9}}
            >
              {sym}
            </motion.div>
          );
        })}
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        style={{position:'fixed',top:0,left:0,right:0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'rgba(5,11,21,0.82)',backdropFilter:'blur(24px)',borderBottom:'1px solid var(--border-color)',zIndex:100}}
        initial={{y:-80,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}}
      >
        <motion.div style={{display:'flex',alignItems:'center',gap:14}} whileHover={{scale:1.03}}>

          {/* ── LOGO IMAGE ── */}
          <motion.img
            src={logo}
            alt="AlgoTrack logo"
            style={{
              height: 52,          /* increase this number to make logo taller */
              width: 'auto',       /* width scales automatically */
              maxWidth: 160,       /* prevents an overly wide logo from overflowing */
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 0 10px rgba(108,99,255,0.55))',
            }}
            animate={{filter:[
              'drop-shadow(0 0 8px rgba(108,99,255,0.5))',
              'drop-shadow(0 0 18px rgba(108,99,255,0.85))',
              'drop-shadow(0 0 8px rgba(108,99,255,0.5))',
            ]}}
            transition={{duration:2.8, repeat:Infinity, ease:'easeInOut'}}
          />

        </motion.div>
        <div style={{display:'flex',gap:12}}>
          {user ? (
            <motion.button className="btn btn-primary" onClick={()=>navigate('/dashboard')} whileHover={{scale:1.05}} whileTap={{scale:0.97}}>Go to Dashboard →</motion.button>
          ) : (
            <>
              <motion.button className="btn btn-ghost" onClick={()=>navigate('/login')} whileHover={{scale:1.03}}>Sign In</motion.button>
              <motion.button className="btn btn-primary" onClick={()=>navigate('/login')} whileHover={{scale:1.05}}>Get Started →</motion.button>
            </>
          )}
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="hero" style={{paddingTop:120,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',zIndex:1,gap:0}}>
        {/* Badge */}
        <motion.div
          className="hero-badge"
          initial={{opacity:0,y:24,scale:0.9}} animate={{opacity:1,y:0,scale:1}} transition={{delay:0.2,duration:0.6}}
          style={{marginBottom:28}}
        >
          <motion.span animate={{rotate:[0,14,-10,14,0]}} transition={{duration:2,repeat:Infinity,repeatDelay:3}}></motion.span>
          Smart DSA Progress Tracking
        </motion.div>

        {/* Main layout: text left, code editor right */}
        <div style={{display:'flex',alignItems:'center',gap:60,width:'100%',maxWidth:1100,padding:'0 40px',flexWrap:'wrap',justifyContent:'center'}}>
          {/* Text */}
          <div style={{flex:1,minWidth:280,textAlign:'left'}}>
            <motion.h1
              className="hero-title"
              initial={{opacity:0,y:36}} animate={{opacity:1,y:0}} transition={{delay:0.35,duration:0.7,ease:[0.22,1,0.36,1]}}
              style={{x:px,y:py,marginBottom:20}}
            >
              Track your DSA journey<br />
              <span className="gradient-text">with&nbsp;</span>
              <span style={{
                background:'var(--gradient-primary)',
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent',
                backgroundClip:'text',
                borderRight:'3px solid rgba(108,99,255,0.9)',
                paddingRight:4,
              }}>
                {typedWord}
              </span>
            </motion.h1>
            <motion.p
              className="hero-desc"
              style={{maxWidth:500,x:px2,textAlign:'left'}}
              initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.7}}
            >
              AlgoTrack combines beautiful analytics, streak tracking, and AI-powered insights to help you solve DSA problems smarter — and land that dream offer.
            </motion.p>
            <motion.div
              className="hero-actions"
              style={{justifyContent:'flex-start'}}
              initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.65,duration:0.6}}
            >
              <motion.button
                className="btn btn-primary btn-lg"
                onClick={()=>navigate('/login')}
                whileHover={{scale:1.06,boxShadow:'0 12px 40px rgba(108,99,255,0.6)'}}
                whileTap={{scale:0.97}}
              >
                 Start Tracking Free
              </motion.button>
              <motion.button className="btn btn-ghost btn-lg" onClick={()=>navigate('/login')} whileHover={{scale:1.03}}>
                Sign In →
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              style={{display:'flex',gap:36,marginTop:48,flexWrap:'wrap'}}
              initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}}
            >
              {[['2500+','Problems Catalogued'],['50+','DSA Topics'],['7','Smart Insights']].map(([n,l])=>(
                <div key={l} style={{textAlign:'left'}}>
                  <div style={{fontSize:30,fontWeight:900,background:'var(--gradient-primary)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                    <Counter target={n} />
                  </div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Code Editor Mockup */}
          <motion.div style={{x:px,y:py2}}>
            <CodeEditor />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          style={{position:'absolute',bottom:36,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8,color:'rgba(255,255,255,0.25)',fontSize:12,letterSpacing:'0.1em'}}
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.6}}
        >
          <span>SCROLL</span>
          <motion.div
            style={{width:1,height:40,background:'linear-gradient(180deg,rgba(108,99,255,0.6),transparent)'}}
            animate={{scaleY:[1,0.3,1],opacity:[0.6,0.1,0.6]}}
            transition={{duration:2,repeat:Infinity}}
          />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={{position:'relative',zIndex:1}}>
        <motion.div
          style={{textAlign:'center',padding:'0 40px 48px'}}
          initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}}
        >
          <motion.div
            style={{display:'inline-block',padding:'4px 16px',borderRadius:999,background:'rgba(108,99,255,0.12)',border:'1px solid rgba(108,99,255,0.25)',fontSize:12,color:'var(--accent-primary)',fontWeight:700,letterSpacing:'0.08em',marginBottom:16}}
          >
            FEATURES
          </motion.div>
          <h2 style={{fontSize:38,fontWeight:800,color:'var(--text-primary)',marginBottom:12}}>Everything you need</h2>
          <p style={{color:'var(--text-secondary)',fontSize:16}}>Built for serious DSA practitioners who want to win</p>
        </motion.div>
        <div className="features-grid">
          {features.map((f,i)=><FeatureCard key={f.title} f={f} i={i} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{textAlign:'center',padding:'100px 40px',position:'relative',zIndex:1}}>
        <motion.div
          className="glass-card"
          style={{maxWidth:640,margin:'0 auto',padding:56,background:'var(--gradient-card)',overflow:'hidden',position:'relative'}}
          initial={{opacity:0,scale:0.88,y:30}}
          whileInView={{opacity:1,scale:1,y:0}}
          viewport={{once:true}}
          transition={{duration:0.6,ease:[0.22,1,0.36,1]}}
        >
          {/* Animated corner accents */}
          {['0% 0%','100% 0%','0% 100%','100% 100%'].map((pos,i)=>(
            <motion.div
              key={i}
              style={{
                position:'absolute',
                left: i%2===0 ? -1 : 'auto', right: i%2===1 ? -1 : 'auto',
                top: i<2 ? -1 : 'auto', bottom: i>=2 ? -1 : 'auto',
                width:40,height:40,
                borderTop: i<2 ? '2px solid rgba(108,99,255,0.6)' : 'none',
                borderBottom: i>=2 ? '2px solid rgba(108,99,255,0.6)' : 'none',
                borderLeft: i%2===0 ? '2px solid rgba(108,99,255,0.6)' : 'none',
                borderRight: i%2===1 ? '2px solid rgba(108,99,255,0.6)' : 'none',
              }}
              animate={{opacity:[0.4,1,0.4]}}
              transition={{duration:2.5,repeat:Infinity,delay:i*0.4}}
            />
          ))}

          <motion.div
            style={{fontSize:52,marginBottom:16,display:'inline-block'}}
            animate={{rotate:[0,8,-6,0],scale:[1,1.1,0.95,1]}}
            transition={{duration:3,repeat:Infinity,repeatDelay:2}}
          >🛫</motion.div>
          <h2 style={{fontSize:30,fontWeight:800,color:'var(--text-primary)',marginBottom:14}}>Ready to level up?</h2>
          <p style={{color:'var(--text-secondary)',marginBottom:28,fontSize:15}}>Join thousands of engineers tracking their DSA progress smarter.</p>
          <motion.button
            className="btn btn-primary btn-lg"
            onClick={()=>navigate('/login')}
            whileHover={{scale:1.06,boxShadow:'0 12px 40px rgba(108,99,255,0.6)'}}
            whileTap={{scale:0.97}}
          >
            🚀 Get Started — It's Free
          </motion.button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{textAlign:'center',padding:'24px',borderTop:'1px solid var(--border-color)',color:'var(--text-muted)',fontSize:13,position:'relative',zIndex:1}}>
        © 2026 AlgoTrack — Built for DSA warriors
      </footer>
    </div>
  );
};

export default LandingPage;
